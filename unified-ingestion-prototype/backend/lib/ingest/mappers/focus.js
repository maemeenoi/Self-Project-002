// src/lib/ingest/mappers/focus.js

/**
 * Maps a FOCUS CSV row to our normalized schema
 * Supports AWS, Azure, and GCP billing formats
 */
export function mapFocusRow(row) {
  // Detect provider based on available columns
  const provider = detectProvider(row)

  return {
    provider,
    billing_period: getBillingPeriod(row, provider),
    usage_start: getUsageStart(row, provider),
    usage_end: getUsageEnd(row, provider),
    resource_id: getResourceId(row, provider),
    sku: getSku(row, provider),
    meter: getMeter(row, provider),
    region: getRegion(row, provider),
    currency: getCurrency(row, provider),
    quantity: getQuantity(row, provider),
    unit: getUnit(row, provider),
    public_cost: getPublicCost(row, provider),
    effective_cost: getEffectiveCost(row, provider),
  }
}

function detectProvider(row) {
  // AWS indicators
  if (
    row["bill/PayerAccountId"] ||
    row["lineItem/ProductCode"] ||
    row["product/servicecode"]
  ) {
    return "aws"
  }

  // Azure indicators
  if (row["BillingAccountId"] || row["MeterId"] || row["MeterCategory"]) {
    return "azure"
  }

  // GCP indicators
  if (
    row["billing_account_id"] ||
    row["project.id"] ||
    row["service.description"]
  ) {
    return "gcp"
  }

  // Default fallback
  return "unknown"
}

function getBillingPeriod(row, provider) {
  switch (provider) {
    case "aws":
      return `${row["bill/BillingPeriodStartDate"]}→${row["bill/BillingPeriodEndDate"]}`
    case "azure":
      return row["BillingPeriodStartDate"]
        ? `${row["BillingPeriodStartDate"]}→${row["BillingPeriodEndDate"]}`
        : extractMonthFromDate(row["Date"])
    case "gcp":
      return (
        row["invoice.month"] || extractMonthFromDate(row["usage_start_time"])
      )
    default:
      return null
  }
}

function getUsageStart(row, provider) {
  switch (provider) {
    case "aws":
      return row["lineItem/UsageStartDate"]
    case "azure":
      return row["UsageDateTime"] || row["Date"]
    case "gcp":
      return row["usage_start_time"]
    default:
      return null
  }
}

function getUsageEnd(row, provider) {
  switch (provider) {
    case "aws":
      return row["lineItem/UsageEndDate"]
    case "azure":
      return row["UsageDateTime"] || row["Date"] // Azure often uses single timestamp
    case "gcp":
      return row["usage_end_time"]
    default:
      return null
  }
}

function getResourceId(row, provider) {
  switch (provider) {
    case "aws":
      return row["lineItem/ResourceId"] || row["resourceId"]
    case "azure":
      return row["ResourceId"] || row["InstanceId"]
    case "gcp":
      return row["resource.name"] || row["project.id"]
    default:
      return null
  }
}

function getSku(row, provider) {
  switch (provider) {
    case "aws":
      return row["product/sku"] || row["rateId"]
    case "azure":
      return row["MeterId"] || row["PartNumber"]
    case "gcp":
      return row["sku.id"] || row["sku.description"]
    default:
      return null
  }
}

function getMeter(row, provider) {
  switch (provider) {
    case "aws":
      return row["lineItem/ProductCode"] || row["product/servicecode"]
    case "azure":
      return row["MeterCategory"] || row["MeterSubCategory"]
    case "gcp":
      return row["service.description"] || row["service.id"]
    default:
      return null
  }
}

function getRegion(row, provider) {
  switch (provider) {
    case "aws":
      return row["product/region"] || row["lineItem/AvailabilityZone"]
    case "azure":
      return row["Location"] || row["ResourceLocation"]
    case "gcp":
      return row["location.region"] || row["location.zone"]
    default:
      return null
  }
}

function getCurrency(row, provider) {
  switch (provider) {
    case "aws":
      return row["lineItem/CurrencyCode"] || row["pricing/currency"]
    case "azure":
      return row["BillingCurrencyCode"] || row["Currency"]
    case "gcp":
      return row["currency"] || "USD"
    default:
      return null
  }
}

function getQuantity(row, provider) {
  switch (provider) {
    case "aws":
      return Number(
        row["lineItem/UsageAmount"] ||
          row["lineItem/NormalizedUsageAmount"] ||
          0
      )
    case "azure":
      return Number(row["Quantity"] || row["UsageQuantity"] || 0)
    case "gcp":
      return Number(
        row["usage.amount"] || row["usage.amount_in_pricing_units"] || 0
      )
    default:
      return 0
  }
}

function getUnit(row, provider) {
  switch (provider) {
    case "aws":
      return row["pricing/unit"] || row["lineItem/UsageType"]
    case "azure":
      return row["UnitOfMeasure"] || row["Unit"]
    case "gcp":
      return row["usage.unit"] || row["usage.pricing_unit"]
    default:
      return null
  }
}

function getPublicCost(row, provider) {
  switch (provider) {
    case "aws":
      return Number(
        row["pricing/publicOnDemandCost"] || row["lineItem/UnblendedCost"] || 0
      )
    case "azure":
      return Number(row["PayGPrice"] || row["CostInBillingCurrency"] || 0)
    case "gcp":
      return Number(row["cost"] || 0)
    default:
      return 0
  }
}

function getEffectiveCost(row, provider) {
  switch (provider) {
    case "aws":
      return Number(
        row["lineItem/BlendedCost"] ||
          row["reservation/EffectiveCost"] ||
          row["savingsPlan/SavingsPlanEffectiveCost"] ||
          row["lineItem/UnblendedCost"] ||
          0
      )
    case "azure":
      return Number(
        row["CostInUsd"] ||
          row["EffectivePrice"] ||
          row["CostInBillingCurrency"] ||
          0
      )
    case "gcp":
      return Number(row["cost"] || 0)
    default:
      return 0
  }
}

function extractMonthFromDate(dateStr) {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`
  } catch {
    return null
  }
}
