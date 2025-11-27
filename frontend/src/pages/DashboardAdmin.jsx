import React from "react";
import { SummaryCards, useDashboardSummary } from "./DashboardShared";

const DashboardAdmin = () => {
  const { data, loading, error } = useDashboardSummary("admin");

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 12px" }}>Dashboard Admin</h2>
      <p style={{ margin: "0 0 16px", color: "#4a5568" }}>
        Ringkasan global pengajuan, logbook, laporan, dan penilaian.
      </p>
      {loading && <p>Memuat ringkasan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && <SummaryCards data={data} roleLabel="Admin" />}
    </div>
  );
};

export default DashboardAdmin;