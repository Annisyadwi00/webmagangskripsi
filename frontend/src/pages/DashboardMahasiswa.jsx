import React from "react";
import { SummaryCards, useDashboardSummary } from "./DashboardShared";

const DashboardMahasiswa = ({ mahasiswaId, nama }) => {
  const { data, loading, error } = useDashboardSummary("mahasiswa", mahasiswaId);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 12px" }}>Dashboard Mahasiswa</h2>
      <p style={{ margin: "0 0 16px", color: "#4a5568" }}>
        Selamat datang{nama ? `, ${nama}` : ""}! Lihat progres pengajuan dan logbook kamu.
      </p>
      {loading && <p>Memuat ringkasan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && <SummaryCards data={data} roleLabel="Mahasiswa" />}
      {!mahasiswaId && (
        <p style={{ marginTop: 12, color: "#e53e3e" }}>
          Masukkan <code>mahasiswaId</code> sebagai prop agar data spesifik mahasiswa muncul.
        </p>
      )}
    </div>
  );
};

export default DashboardMahasiswa;