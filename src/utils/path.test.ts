import { describe, expect, it } from "vitest";
import { isWithinBase } from "./path.js";

describe("isWithinBase", () => {
  it("returns true for a child path", () => {
    expect(isWithinBase("/home/user/docs", "/home/user/docs/file.md")).toBe(
      true,
    );
  });

  it("returns true for a nested child path", () => {
    expect(isWithinBase("/home/user/docs", "/home/user/docs/sub/file.md")).toBe(
      true,
    );
  });

  it("returns false for a parent path", () => {
    expect(isWithinBase("/home/user/docs", "/home/user")).toBe(false);
  });

  it("returns false for path traversal", () => {
    expect(
      isWithinBase("/home/user/docs", "/home/user/docs/../../../etc/passwd"),
    ).toBe(false);
  });

  it("returns false for the base path itself", () => {
    expect(isWithinBase("/home/user/docs", "/home/user/docs")).toBe(false);
  });

  it("returns false for a sibling path with common prefix", () => {
    expect(isWithinBase("/home/user/docs", "/home/user/docs-backup/f.md")).toBe(
      false,
    );
  });
});
