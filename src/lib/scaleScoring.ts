type MmsePayload = {
  orientation_time: number;
  orientation_place: number;
  registration: number;
  attention_calc: number;
  recall: number;
  language: number;
  repetition: number;
  three_step: number;
  reading: number;
  writing: number;
  drawing: number;
};

type CdrPayload = {
  memory: number;
  orientation: number;
  judgment: number;
  community: number;
  home_hobbies: number;
  personal_care: number;
};

export function scoreMMSE(payload: MmsePayload) {
  const total =
    payload.orientation_time +
    payload.orientation_place +
    payload.registration +
    payload.attention_calc +
    payload.recall +
    payload.language +
    payload.repetition +
    payload.three_step +
    payload.reading +
    payload.writing +
    payload.drawing;

  return { total, max: 30 };
}

export function scoreCDR(payload: CdrPayload) {
  const values = [
    payload.memory,
    payload.orientation,
    payload.judgment,
    payload.community,
    payload.home_hobbies,
    payload.personal_care,
  ];

  const personalCare = payload.personal_care;
  let global = 0;
  if (personalCare >= 2) {
    global = personalCare;
  } else {
    const sorted = [...values].sort((a, b) => a - b);
    global = sorted[Math.floor(sorted.length / 2)];
  }

  return { global, max: 3 };
}
