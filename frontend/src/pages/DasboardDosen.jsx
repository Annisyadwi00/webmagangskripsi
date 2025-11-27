import React from "react";
import { SummaryCards, useDashboardSummary } from "./DashboardShared";

const DashboardDosen = () => {
  const { data, loading, error } = useDashboardSummary("dosen");

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 12px" }}>Dashboard Dosen</h2>
      <p style={{ margin: "0 0 16px", color: "#4a5568" }}>
        Pantau progres mahasiswa bimbingan dan distribusi pengajuan.
      </p>
      {loading && <p>Memuat ringkasan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && <SummaryCards data={data} roleLabel="Dosen" />}
    </div>
  );
};

export default DashboardDosen;