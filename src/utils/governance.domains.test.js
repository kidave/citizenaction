import { describe, expect, it } from "vitest";
import { getGovernanceHref, getGovernanceRoute, GOVERNANCE_DOMAINS } from "./governance.js";

describe("governance domain routes", () => {
  it("exposes exactly the four supported domains", () => {
    expect(GOVERNANCE_DOMAINS.map(({ value }) => value)).toEqual([
      "politics", "legislature", "executive", "judiciary",
    ]);
  });
  it("uses domain-based organization profile URLs when assigned", () => {
    expect(getGovernanceHref({ slug: "lok-sabha", domain: "legislature" }))
      .toBe("/legislature/lok-sabha");
    expect(getGovernanceRoute({ slug: "lok-sabha", domain: "legislature" }))
      .toEqual({ pathname: "/legislature/[...path]", query: { path: ["lok-sabha"] } });
  });
  it("keeps unassigned organizations on the legacy governance route", () => {
    expect(getGovernanceHref({ slug: "public-works" })).toBe("/governance/public-works");
  });
  it("routes people and positions through their organization domain", () => {
    const person = { type: "person", slug: "member-one", domain: "legislature" };
    const position = { type: "position", slug: "commissioner", parent_slug: "municipal-corporation", domain: "executive" };
    expect(getGovernanceHref(person)).toBe("/legislature/person/member-one");
    expect(getGovernanceRoute(person)).toEqual({
      pathname: "/legislature/person/[personSlug]",
      query: { personSlug: "member-one" },
    });
    expect(getGovernanceHref(position)).toBe("/executive/municipal-corporation/commissioner");
    expect(getGovernanceRoute(position)).toEqual({
      pathname: "/executive/[organizationSlug]/[positionSlug]",
      query: { organizationSlug: "municipal-corporation", positionSlug: "commissioner" },
    });
  });
});
