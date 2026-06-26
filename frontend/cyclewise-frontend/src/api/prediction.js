import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: BASE, withCredentials: true });

/**
 * Stage A — symptom screening only, no labs needed.
 * @param {Object} data  Keys: age, height_cm, weight_kg, bmi, waist_cm, hip_cm,
 *                       waist_hip_ratio, bp_systolic, bp_diastolic, cycle_irregular,
 *                       cycle_length_days, weight_gain, hair_growth_excess,
 *                       skin_darkening, hair_loss, pimples, fast_food_frequent,
 *                       regular_exercise
 */
export async function runStageA(data) {
  const { data: res } = await api.post("/predict/stage-a", data);
  return res;
  // Returns: { probability: number, route: "LOW_RISK"|"AMBIGUOUS_GO_TO_STAGE_B"|"HIGH_RISK" }
}

/**
 * Stage B — confirmatory, requires all Stage A fields + labs + ultrasound.
 * Additional keys: fsh, lh, lh_fsh_ratio, amh, testosterone_ng_ml, tsh,
 *                  prolactin, follicle_no_l, follicle_no_r,
 *                  avg_f_size_l_mm, avg_f_size_r_mm, endometrium_mm
 */
export async function runStageB(data) {
  const { data: res } = await api.post("/predict/stage-b", data);
  return res;
  // Returns: { probability, outcome, lifestyle_score }
}

/**
 * Full pipeline — pass all fields, backend decides routing automatically.
 * Best for a single-form submission.
 */
export async function runFullPipeline(data) {
  const { data: res } = await api.post("/predict/full-pipeline", data);
  return res;
  // Returns: { stage_a, stage_b | null, final_output: { status, ... } }
}