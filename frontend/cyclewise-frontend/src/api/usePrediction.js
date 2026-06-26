import { useState } from "react";
import { runStageA, runStageB } from "../api/prediction";

/**
 * Manages the two-stage prediction UI flow:
 *   1. User fills symptom form → Stage A called
 *   2. If AMBIGUOUS, show lab input form → Stage B called
 *   3. Final result drives what the UI renders
 *
 * Usage:
 *   const { stage, stageAResult, stageBResult, finalOutput,
 *           loading, error, submitStageA, submitStageB, reset } = usePrediction();
 */
export function usePrediction() {
  const [stage, setStage] = useState("A");            // "A" | "B" | "DONE"
  const [stageAResult, setStageAResult] = useState(null);
  const [stageBResult, setStageBResult] = useState(null);
  const [finalOutput, setFinalOutput]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Keeps Stage A form data so we can merge it with lab fields for Stage B
  const [stageAData, setStageAData]     = useState(null);

  async function submitStageA(formData) {
    setLoading(true);
    setError(null);
    try {
      const result = await runStageA(formData);
      setStageAResult(result);
      setStageAData(formData);

      if (result.route === "LOW_RISK") {
        setFinalOutput({ status: "LOW_RISK", message: "No PCOS indicators detected." });
        setStage("DONE");
      } else if (result.route === "HIGH_RISK") {
        // HIGH_RISK goes straight to clinical — no labs needed
        setFinalOutput({ status: "HIGH_RISK_REFER_CLINICAL" });
        setStage("DONE");
      } else {
        // AMBIGUOUS → ask for labs
        setStage("B");
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitStageB(labData) {
    setLoading(true);
    setError(null);
    try {
      // Merge symptom data + lab data into one payload
      const fullPayload = { ...stageAData, ...labData };
      const result = await runStageB(fullPayload);
      setStageBResult(result);

      // Map model outcome → UI status
      if (result.outcome === "NOT_CONFIRMED") {
        setFinalOutput({ status: "NOT_CONFIRMED", message: "PCOS not confirmed." });
      } else if (result.outcome === "LIFESTYLE_DRIVEN_REFER_LIFESTYLE_ENGINE") {
        setFinalOutput({ status: "LIFESTYLE_DRIVEN" });
      } else {
        setFinalOutput({ status: "CONFIRMED_PCOS" });
      }
      setStage("DONE");
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStage("A");
    setStageAResult(null);
    setStageBResult(null);
    setFinalOutput(null);
    setStageAData(null);
    setError(null);
  }

  return {
    stage,           // which step the user is on
    stageAResult,    // { probability, route }
    stageBResult,    // { probability, outcome, lifestyle_score } | null
    finalOutput,     // { status, ... } — drives what the result page shows
    loading,
    error,
    submitStageA,
    submitStageB,
    reset,
  };
}