import { formatPackPrice, formatBytes } from "./formatPrice";

describe("formatPackPrice", () => {
  it("formats ARS in Spanish", () => {
    expect(formatPackPrice({ priceArs: 25000 }, "es")).toMatch(/25\.000/);
  });
  it("uses USD in English when set", () => {
    expect(formatPackPrice({ priceArs: 25000, priceUsd: 15 }, "en")).toMatch(/\$15/);
  });
  it("falls back to ARS in English without USD price", () => {
    expect(formatPackPrice({ priceArs: 25000 }, "en")).toMatch(/25,000/);
  });
});

describe("formatBytes", () => {
  it("formats megabytes", () => {
    expect(formatBytes(149946368)).toBe("143 MB");
  });
});
