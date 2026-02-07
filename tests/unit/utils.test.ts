import { describe, it, expect } from "vitest";
import { parseWithInterpretation, getFormattedTimestamp } from "../builtins/utils";

describe("parseWithInterpretation", () => {
	it("parses integer values", () => {
		expect(parseWithInterpretation("42", "integer")).toBe(42);
	});

	it("parses boolean values", () => {
		expect(parseWithInterpretation("true", "boolean")).toBe(true);
	});

	it("parses string values", () => {
		expect(parseWithInterpretation(123, "string")).toBe("123");
	});

	it("returns raw value for unknown interpretation", () => {
		expect(parseWithInterpretation('{"a":1}', "object")).toEqual({ a: 1 });
	});
});

describe("getFormattedTimestamp", () => {
	it("returns timestamp with HH:MM:SS.mmm format", () => {
		const ts = getFormattedTimestamp();
		expect(ts).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
	});
});
