"use client";

import { setCandidateStatus } from "@/app/admin/crm/prospecting/actions";

export default function ProspectingCandidateStatusForm({
  candidateId,
  status,
}: {
  candidateId: string;
  status: string;
}) {
  return (
    <form action={setCandidateStatus}>
      <input type="hidden" name="candidate_id" value={candidateId} />

      <select
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded bg-black/20 p-2 text-xs text-white"
      >
        <option value="researching">Research</option>
        <option value="qualified">Qualify</option>
        <option value="ready">Ready</option>
        <option value="rejected">Reject</option>
      </select>
    </form>
  );
}
