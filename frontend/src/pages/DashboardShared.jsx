import React, { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1/dashboard";

export function useDashboardSummary(role, mahasiswaId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ role });
        if (mahasiswaId) {
          params.append("mahasiswaId", mahasiswaId);
        }

        const res = await fetch(`${API_BASE}?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Gagal memuat data dashboard");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [role, mahasiswaId]);

  return { data, loading, error };
}

export function SummaryCards({ data, roleLabel }) {
  const pengajuanList = useMemo(
    () => [
      { label: "Pending", value: data?.pengajuan?.pending ?? 0 },
      { label: "Disetujui", value: data?.pengajuan?.disetujui ?? 0 },
      { label: "Ditolak", value: data?.pengajuan?.ditolak ?? 0 },
    ],
    [data]
  );

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginTop: 16,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 8px" }}>Pengajuan per Status</h3>
        <div style={gridStyle}>
          {pengajuanList.map((item) => (
            <div key={item.label} style={{ ...cardStyle, margin: 0 }}>
              <p style={{ margin: 0, color: "#718096" }}>{item.label}</p>
              <h2 style={{ margin: "4px 0 0" }}>{item.value}</h2>
            </div>
          ))}
        </div>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px" }}>Progress Logbook</h3>
          <p style={{ margin: "4px 0" }}>
            Total entri: <strong>{data?.logbook?.total ?? 0}</strong>
          </p>
          {data?.logbook?.progresMahasiswa !== undefined ? (
            <p style={{ margin: "4px 0", color: "#4a5568" }}>
              Progress Anda: {data.logbook.progresMahasiswa} entri
            </p>
          ) : (
            <>
              <p style={{ margin: "4px 0", color: "#4a5568" }}>
                Mahasiswa aktif: {data?.logbook?.mahasiswaAktif ?? 0}
              </p>
              <p style={{ margin: "4px 0", color: "#4a5568" }}>
                Rata-rata entri/mahasiswa: {data?.logbook?.rataRataPerMahasiswa ?? 0}
              </p>
            </>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px" }}>Kelengkapan Laporan</h3>
          <p style={{ margin: "4px 0" }}>
            Laporan selesai: <strong>{data?.laporan?.selesai ?? 0}</strong>
          </p>
          <p style={{ margin: "4px 0", color: "#4a5568" }}>
            Target (pengajuan disetujui): {data?.laporan?.target ?? 0}
          </p>
          <p style={{ margin: "4px 0", color: "#2d3748" }}>
            Persentase: {data?.laporan?.persentase ?? 0}%
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px" }}>Nilai Rata-rata</h3>
          <p style={{ margin: "4px 0" }}>
            Rata-rata nilai: <strong>{data?.nilai?.rataRata ?? "-"}</strong>
          </p>
          <p style={{ margin: "4px 0", color: "#4a5568" }}>
            Total penilaian: {data?.nilai?.total ?? 0}
          </p>
        </div>
      </div>

      <small style={{ color: "#718096" }}>
        Tampilan menyesuaikan peran: {roleLabel}
      </small>
    </div>
  );
}