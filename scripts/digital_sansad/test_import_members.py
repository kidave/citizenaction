"""Regression tests for the Digital Sansad importer; no network or database required."""
import unittest

from scripts.digital_sansad.import_members import (
    find_lok_sabha_governance,
    is_current_lok_sabha_term,
    resolve_geography,
    to_person,
)


class DigitalSansadImporterTests(unittest.TestCase):
    def test_current_term_requires_explicit_18th_lok_sabha_evidence(self):
        self.assertTrue(is_current_lok_sabha_term({"lsExpr": "18th Lok Sabha"}))
        self.assertTrue(is_current_lok_sabha_term({"lsExpr": "18"}))
        self.assertFalse(is_current_lok_sabha_term({"status": "active"}))
        self.assertFalse(is_current_lok_sabha_term({"lsExpr": "17th Lok Sabha", "status": "active"}))
        self.assertFalse(is_current_lok_sabha_term({"lsExpr": "18th Lok Sabha", "status": "former"}))
        self.assertFalse(is_current_lok_sabha_term({"lsExpr": "18th Lok Sabha", "status": "resigned"}))
        self.assertFalse(is_current_lok_sabha_term({}))

    def test_lok_sabha_must_be_child_of_parliament(self):
        rows = [
            {"id": "p1", "name": "Parliament of India", "type": "legislature"},
            {"id": "ls1", "name": "Lok Sabha", "type": "legislative_house", "parent_entity_id": "p1"},
            {"id": "ls2", "name": "Lok Sabha", "type": "legislative_house", "parent_entity_id": "other"},
            {"id": "rs1", "name": "Rajya Sabha", "type": "legislative_house", "parent_entity_id": "p1"},
        ]
        parliaments, houses = find_lok_sabha_governance(rows)
        self.assertEqual([r["id"] for r in parliaments], ["p1"])
        self.assertEqual([r["id"] for r in houses], ["ls1"])

    def test_duplicate_parliament_fails_closed(self):
        rows = [
            {"id": "p1", "name": "Parliament of India"},
            {"id": "p2", "name": "Parliament of India"},
            {"id": "ls1", "name": "Lok Sabha", "type": "legislative_house", "parent_entity_id": "p1"},
        ]
        parliaments, houses = find_lok_sabha_governance(rows)
        self.assertEqual(len(parliaments), 2)
        self.assertEqual(houses, [])

    def test_person_maps_public_contact_fields_without_constituency_metadata(self):
        person = to_person({
            "mpsno": 344,
            "fullName": "Example Member",
            "constituency": "Example Constituency",
            "email": "member@example.in",
            "phone": "011-12345678",
            "birthDate": "01/01/1970",
        })
        self.assertEqual(person["email"], "member@example.in")
        self.assertEqual(person["phone"], "011-12345678")
        self.assertNotIn("constituency", person["metadata"])
        self.assertNotIn("lsExpr", person["metadata"])
        self.assertNotIn("status", person["metadata"])
        self.assertEqual(person["metadata"]["mpsno"], "344")

    def test_geography_resolution_requires_unique_match(self):
        rows = [{"id": "g1", "name": "Example", "slug": "example", "other_names": [], "status": "active"}]
        self.assertEqual(resolve_geography("Example", rows)[0], "g1")
        rows.append({"id": "g2", "name": "Other", "slug": "other", "other_names": ["Example"], "status": "active"})
        geography_id, ambiguous, _ = resolve_geography("Example", rows)
        self.assertIsNone(geography_id)
        self.assertTrue(ambiguous)


if __name__ == "__main__":
    unittest.main()
