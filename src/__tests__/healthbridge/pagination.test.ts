import { describe, it, expect } from "vitest";
import { parsePaginationParams, paginateResult } from "@/lib/healthbridge/pagination";

describe("Pagination — parsePaginationParams", () => {
  it("should use default values when no params provided", () => {
    const url = new URL("https://example.com/api/claims");
    const result = parsePaginationParams(url);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it("should parse custom page and pageSize", () => {
    const url = new URL("https://example.com/api/claims?page=3&pageSize=50");
    const result = parsePaginationParams(url);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
    expect(result.skip).toBe(100); // (3-1) * 50
    expect(result.take).toBe(50);
  });

  it("should clamp page to minimum of 1", () => {
    const url = new URL("https://example.com/api/claims?page=0");
    const result = parsePaginationParams(url);
    expect(result.page).toBe(1);
  });

  it("should clamp negative page to 1", () => {
    const url = new URL("https://example.com/api/claims?page=-5");
    const result = parsePaginationParams(url);
    expect(result.page).toBe(1);
  });

  it("should cap pageSize at MAX_PAGE_SIZE (100)", () => {
    const url = new URL("https://example.com/api/claims?pageSize=500");
    const result = parsePaginationParams(url);
    expect(result.pageSize).toBe(100);
  });

  it("should clamp pageSize to minimum of 1", () => {
    const url = new URL("https://example.com/api/claims?pageSize=0");
    const result = parsePaginationParams(url);
    expect(result.pageSize).toBe(1);
  });

  it("should clamp negative pageSize to 1", () => {
    const url = new URL("https://example.com/api/claims?pageSize=-10");
    const result = parsePaginationParams(url);
    expect(result.pageSize).toBe(1);
  });

  it("should handle non-numeric page (NaN fallback)", () => {
    const url = new URL("https://example.com/api/claims?page=abc");
    const result = parsePaginationParams(url);
    expect(result.page).toBe(1);
  });

  it("should handle non-numeric pageSize (NaN fallback)", () => {
    const url = new URL("https://example.com/api/claims?pageSize=abc");
    const result = parsePaginationParams(url);
    expect(result.pageSize).toBe(20);
  });

  it("should calculate skip correctly for page 2, pageSize 25", () => {
    const url = new URL("https://example.com/api/claims?page=2&pageSize=25");
    const result = parsePaginationParams(url);
    expect(result.skip).toBe(25);
    expect(result.take).toBe(25);
  });
});

describe("Pagination — paginateResult", () => {
  it("should wrap data with correct pagination metadata", () => {
    const data = ["a", "b", "c"];
    const result = paginateResult(data, 30, 1, 20);
    expect(result.data).toEqual(["a", "b", "c"]);
    expect(result.pagination.total).toBe(30);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(20);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("should set hasNext=false on last page", () => {
    const result = paginateResult(["x"], 15, 2, 10);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(true);
  });

  it("should handle single page of results", () => {
    const result = paginateResult([1, 2, 3], 3, 1, 20);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("should handle empty dataset", () => {
    const result = paginateResult([], 0, 1, 20);
    expect(result.data).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(1); // minimum 1 page
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("should handle page beyond total (no crash)", () => {
    const result = paginateResult([], 10, 5, 20);
    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(true);
  });

  it("should handle single item", () => {
    const result = paginateResult(["only"], 1, 1, 20);
    expect(result.data).toEqual(["only"]);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNext).toBe(false);
  });

  it("should calculate totalPages correctly with exact division", () => {
    const result = paginateResult([], 100, 1, 10);
    expect(result.pagination.totalPages).toBe(10);
  });

  it("should calculate totalPages correctly with remainder", () => {
    const result = paginateResult([], 101, 1, 10);
    expect(result.pagination.totalPages).toBe(11);
  });
});
