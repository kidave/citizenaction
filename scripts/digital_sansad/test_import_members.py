"""Regression tests for the Digital Sansad importer; no network or database required."""
import unittest

from scripts.digital_sansad.import_members import (
    find_lok_sabha_governance,
    resolve_party,
    appointment_fields_from_source,
    appointment_status_from_source,
    is_current_lok_sabha_term,
    extract_lok_sabha_term,
    extract_lok_sabha_terms,
    is_constituency_applicable,
    appointment_dates_from_source,
    normalize_education,
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

    def test_appointment_status_comes_from_the_matching_source_record(self):
        suspended = {"mpsno": 1, "status": "suspended", "officialPhone": "011-5555", "officialEmail": "office@example.in"}
        sitting = {"mpsno": 2, "status": "active", "officialPhone": "011-6666"}
        self.assertEqual(appointment_status_from_source(suspended, True), "suspended")
        self.assertEqual(appointment_status_from_source(sitting, True), "sitting")
        self.assertEqual(appointment_status_from_source({}, True), "sitting")
        self.assertEqual(appointment_status_from_source({}, False), "unknown")
        fields = appointment_fields_from_source(suspended, True)
        self.assertEqual(fields, {
            "term": None, "started_at": None, "ended_at": None,
            "appointment_status": "suspended",
            "official_phone": "011-5555",
            "official_email": "office@example.in",
        })
        # A following row must not leak its status or contact fields into this one.
        other = appointment_fields_from_source(sitting, True)
        self.assertEqual(other["official_phone"], "011-6666")
        self.assertIsNone(other["official_email"])

    def test_lok_sabha_must_be_child_of_parliament(self):
        rows = [
            {"id": "p1", "name": "Parliament of India", "type": "legislature"},
            {"id": "ls1", "name": "Lok Sabha", "type": "legislature", "parent_entity_id": "p1"},
            {"id": "ls2", "name": "Lok Sabha", "type": "legislature", "parent_entity_id": "other"},
            {"id": "rs1", "name": "Rajya Sabha", "type": "legislature", "parent_entity_id": "p1"},
        ]
        parliaments, houses = find_lok_sabha_governance(rows)
        self.assertEqual([r["id"] for r in parliaments], ["p1"])
        self.assertEqual([r["id"] for r in houses], ["ls1"])

    def test_duplicate_parliament_fails_closed(self):
        rows = [
            {"id": "p1", "name": "Parliament of India"},
            {"id": "p2", "name": "Parliament of India"},
            {"id": "ls1", "name": "Lok Sabha", "type": "legislature", "parent_entity_id": "p1"},
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
            "qualification": "Graduate",
            "education": "Bachelor of Arts",
            "profession": "Lawyer",
        })
        self.assertEqual(person["email"], "member@example.in")
        self.assertEqual(person["phone"], "011-12345678")
        self.assertEqual(person["metadata"]["education"], [
            {"qualification": "Graduate"},
            {"qualification": "Bachelor of Arts"},
        ])
        self.assertEqual(person["metadata"]["professions"], [{"title": "Lawyer"}])
        self.assertNotIn("qualification", person)
        self.assertNotIn("profession", person)
        self.assertEqual(person["birth_date"], "1970-01-01")
        self.assertNotIn("constituency", person["metadata"])
        self.assertNotIn("lsExpr", person["metadata"])
        self.assertNotIn("status", person["metadata"])
        self.assertEqual(person["metadata"]["mpsno"], "344")


    def test_multiple_qualifications_and_professions_are_canonical_metadata(self):
        person = to_person({
            "mpsno": 346,
            "fullName": "Multi Profile Example",
            "qualification": ["Graduate", "Post Graduate"],
            "education": [
                {"degree": "B.A.", "institution": "Example University"},
                {"degree": "LL.B."},
            ],
            "profession": "Advocate; Social Worker",
            "profession2": "Farmer",
        })
        metadata = person["metadata"]
        self.assertEqual(metadata["education"], [
            {"qualification": "Graduate; Post Graduate"},
            {"qualification": "B.A.", "institution": "Example University"},
            {"qualification": "LL.B."},
        ])
        self.assertEqual(metadata["professions"], [
            {"title": "Advocate"}, {"title": "Social Worker"}, {"title": "Farmer"},
        ])
        self.assertNotIn("qualification", person)
        self.assertNotIn("profession", person)

    def test_party_resolution_prefers_stable_digital_sansad_source_identity(self):
        parties = [
            {"id": "party-1", "name": "Example Party", "short_name": "EP", "type": "political_party",
             "source_system": "digital_sansad", "source_id": "101"},
            {"id": "party-2", "name": "Example Party", "short_name": "EP", "type": "political_party",
             "source_system": "digital_sansad", "source_id": "202"},
        ]
        party, ambiguous = resolve_party("Example Party", parties, "202")
        self.assertEqual(party["id"], "party-2")
        self.assertFalse(ambiguous)
        party, ambiguous = resolve_party("Example Party", parties)
        self.assertIsNone(party)
        self.assertTrue(ambiguous)

    def test_structured_education_values_are_flattened(self):
        person = to_person({
            "mpsno": 345,
            "fullName": "Education Example",
            "education": [
                {"degree": "B.A.", "institution": "Example University"},
                "LL.B.",
            ],
        })
        self.assertEqual(person["metadata"]["education"], [
            {"qualification": "B.A.", "institution": "Example University"},
            {"qualification": "LL.B."},
        ])

    def test_comma_separated_lok_sabha_terms_create_individual_terms(self):
        record = {"mpsno": "2813", "fullName": "Mrutyunjaya Nayak", "lsExpr": "7,10,11"}
        self.assertEqual(extract_lok_sabha_terms(record), [
            "7th Lok Sabha", "10th Lok Sabha", "11th Lok Sabha",
        ])
        self.assertIsNone(extract_lok_sabha_term(record))
        self.assertEqual(extract_lok_sabha_terms({"lsExpr": "18th Lok Sabha"}), ["18th Lok Sabha"])
        self.assertEqual(extract_lok_sabha_terms({"lsExpr": "17th and 18th Lok Sabha"}), [
            "17th Lok Sabha", "18th Lok Sabha",
        ])

    def test_constituency_absence_is_not_a_failed_geography_match(self):
        self.assertFalse(is_constituency_applicable({}, None))
        self.assertFalse(is_constituency_applicable({"isNominated": True}, ""))
        self.assertFalse(is_constituency_applicable({}, "Nominated"))
        self.assertFalse(is_constituency_applicable({}, "N/A"))
        self.assertTrue(is_constituency_applicable({}, "Phulbani"))

    def test_term_and_dates_are_extracted_without_inventing_historical_dates(self):
        self.assertEqual(extract_lok_sabha_term({"lsExpr": "17th Lok Sabha"}), "17th Lok Sabha")
        self.assertEqual(extract_lok_sabha_term({"lsExpr": "18th Lok Sabha"}), "18th Lok Sabha")
        self.assertIsNone(extract_lok_sabha_term({"lsExpr": "17th and 18th Lok Sabha"}))
        self.assertEqual(appointment_dates_from_source({"startDate": "04/06/2019", "endDate": "01/06/2024"}, "17th Lok Sabha"), ("2019-06-04", "2024-06-01"))
        self.assertEqual(appointment_dates_from_source({}, "17th Lok Sabha"), (None, None))
        self.assertEqual(appointment_dates_from_source({}, "18th Lok Sabha"), ("2024-06-24", None))

    def test_education_is_structured_and_multiple_degrees_are_preserved(self):
        self.assertEqual(normalize_education(["Bachelor of Arts", {"degree": "B.Com.", "institution": "Example College"}]), [
            {"qualification": "Bachelor of Arts"},
            {"qualification": "B.Com.", "institution": "Example College"},
        ])

    def test_geography_resolution_requires_unique_match(self):
        rows = [{"id": "g1", "name": "Example", "slug": "example", "other_names": [], "status": "active"}]
        self.assertEqual(resolve_geography("Example", rows)[0], "g1")
        rows.append({"id": "g2", "name": "Other", "slug": "other", "other_names": ["Example"], "status": "active"})
        geography_id, ambiguous, _ = resolve_geography("Example", rows)
        self.assertIsNone(geography_id)
        self.assertTrue(ambiguous)


if __name__ == "__main__":
    unittest.main()
