const GIG_TYPES = new Set(["free", "paid"]);
const ROLE_TYPES = new Set(["instrumentalist", "backup_vocalist"]);

export const FREE_GIG_POSTING_FEE = 5000;
export const PAID_GIG_POSTING_FEE = 10000;
export const MINIMUM_PAID_GIG_AMOUNT = 25000;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isWholeNaira(value) {
  return Number.isInteger(value) && value >= 0;
}

function validationError(message, errors) {
  const error = new Error(message);
  error.statusCode = 400;
  error.errors = errors;
  return error;
}

/**
 * Validates and normalizes the customer-controlled fields of a gig draft.
 * System-controlled payment and publication fields are deliberately omitted.
 */
export function validateGigDraft(input = {}) {
  input = input && typeof input === "object" ? input : {};
  const errors = [];
  const gigType = input.gigType;

  if (!GIG_TYPES.has(gigType)) {
    errors.push("gigType must be either free or paid.");
  }

  const positions = Array.isArray(input.positions) ? input.positions : [];
  if (positions.length === 0) {
    errors.push("At least one required position is needed.");
  }

  const normalizedPositions = positions.map((position, index) => {
    const prefix = `positions[${index}]`;
    const roleType = position?.roleType;
    const instrument = isNonEmptyString(position?.instrument)
      ? position.instrument.trim()
      : null;
    const songs = Array.isArray(position?.auditionSongs)
      ? position.auditionSongs.map((song) => (typeof song === "string" ? song.trim() : song))
      : [];

    if (!ROLE_TYPES.has(roleType)) {
      errors.push(`${prefix}.roleType must be instrumentalist or backup_vocalist.`);
    }
    if (!Number.isInteger(position?.slots) || position.slots < 1) {
      errors.push(`${prefix}.slots must be a positive whole number.`);
    }
    if (songs.length !== 3 || songs.some((song) => !isNonEmptyString(song))) {
      errors.push(`${prefix}.auditionSongs must contain exactly three non-empty songs.`);
    }
    if (roleType === "instrumentalist" && !instrument) {
      errors.push(`${prefix}.instrument is required for instrumentalists.`);
    }

    return {
      roleType,
      instrument,
      slots: position?.slots,
      auditionSongs: songs,
    };
  });

  let paymentRange = null;
  let postingFee;

  if (gigType === "free") {
    postingFee = FREE_GIG_POSTING_FEE;
  }

  if (gigType === "paid") {
    const min = input.paymentRange?.min;
    const max = input.paymentRange?.max;

    if (!isWholeNaira(min) || min < MINIMUM_PAID_GIG_AMOUNT) {
      errors.push(`paymentRange.min must be a whole-naira amount of at least ${MINIMUM_PAID_GIG_AMOUNT}.`);
    }
    if (!isWholeNaira(max) || max < min) {
      errors.push("paymentRange.max must be a whole-naira amount greater than or equal to paymentRange.min.");
    }

    paymentRange = { min, max };
    postingFee = PAID_GIG_POSTING_FEE;
  }

  if (errors.length > 0) {
    throw validationError("Gig validation failed.", errors);
  }

  return {
    title: typeof input.title === "string" ? input.title.trim() : input.title,
    eventType: typeof input.eventType === "string" ? input.eventType.trim() : input.eventType,
    description: typeof input.description === "string" ? input.description.trim() : input.description,
    eventDate: input.eventDate,
    eventTime: typeof input.eventTime === "string" ? input.eventTime.trim() : input.eventTime,
    location: typeof input.location === "string" ? input.location.trim() : input.location,
    applicationDeadline: input.applicationDeadline,
    gigType,
    paymentRange,
    positions: normalizedPositions,
    postingFee,
  };
}
