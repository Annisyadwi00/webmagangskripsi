import React, { useEffect, useMemo, useState } from "react";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3000/api/v1";

function LaporanAkhir() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState({ linkLaporan: "", file: null });

  const token = useMemo(() => localStorage.getItem("token"), []);
  const role = useMemo(() => localStorage.getItem("role") || "", []);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/laporan`, { headers });

      if (!res.ok) {
        throw new Error("Gagal memuat data laporan");
      }

      const data = await res.json();
      setLaporan(data);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage("");
      setError("");

      let linkLaporan = form.linkLaporan.trim();
      if (!linkLaporan && form.file) {
        linkLaporan = await convertFileToBase64(form.file);
      }

      if (!linkLaporan) {
        setError("Masukkan link laporan atau unggah berkas.");
        return;
      }

      const res = await fetch(`${API_BASE}/laporan`, {
        method: "POST",
        headers,
        body: JSON.stringify({ linkLaporan, tanggalUnggah: new Date() }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.msg || payload.error || "Gagal mengunggah laporan");
      }

      setForm({ linkLaporan: "", file: null });
      setStatusMessage("Laporan berhasil diunggah dan menunggu verifikasi.");
      fetchLaporan();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const updateStatus = async (id, statusVerifikasi) => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/laporan/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ statusVerifikasi }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.msg || payload.error || "Gagal memperbarui status");
      }

      fetchLaporan();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const deleteLaporan = async (id) => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/laporan/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.msg || payload.error || "Gagal menghapus laporan");
      }

      fetchLaporan();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: 12 }}>
        Laporan Akhir
      </h1>
      <p style={{ marginBottom: 24 }}>
        Unggah laporan akhir magang Anda atau tinjau pengajuan yang sudah dikirim.
      </p>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Unggah Laporan</h2>
        {error && (
          <div style={{ color: "#b91c1c", marginBottom: 12 }}>
            <strong>Error: </strong>
            {error}
          </div>
        )}
        {statusMessage && (
          <div style={{ color: "#047857", marginBottom: 12 }}>{statusMessage}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Link Laporan (opsional jika unggah berkas)</span>
            <input
              type="url"
              name="linkLaporan"
              placeholder="https://drive.google.com/..."
              value={form.linkLaporan}
              onChange={handleChange}
              style={{
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Unggah Berkas (PDF/DOCX)</span>
            <input type="file" name="file" accept=".pdf,.doc,.docx" onChange={handleChange} />
            <small style={{ color: "#6b7280" }}>
              Jika memilih berkas, file akan dikonversi ke base64 dan disimpan sebagai string.
            </small>
          </label>

          <button
            type="submit"
            style={{
              background: "#0ea5e9",
              color: "white",
              padding: "10px 14px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
            disabled={loading}
          >
            {loading ? "Mengunggah..." : "Kirim Laporan"}
          </button>
        </form>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Riwayat Laporan</h2>
        {loading ? (
          <p>Sedang memuat...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                  <th style={{ padding: 10 }}>Mahasiswa ID</th>
                  <th style={{ padding: 10 }}>Link/Berkas</th>
                  <th style={{ padding: 10 }}>Tanggal Unggah</th>
                  <th style={{ padding: 10 }}>Status</th>
                  <th style={{ padding: 10 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {laporan.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 10, textAlign: "center" }}>
                      Belum ada laporan.
                    </td>
                  </tr>
                )}
                {laporan.map((item) => (
                  <tr key={item.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: 10 }}>{item.mahasiswaId}</td>
                    <td style={{ padding: 10 }}>
                      <a
                        href={item.linkLaporan}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#2563eb", wordBreak: "break-all" }}
                      >
                        Lihat Laporan
                      </a>
                    </td>
                    <td style={{ padding: 10 }}>
                      {item.tanggalUnggah
                        ? new Date(item.tanggalUnggah).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: 10, textTransform: "capitalize" }}>
                      {item.statusVerifikasi}
                    </td>
                    <td style={{ padding: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {role !== "mahasiswa" && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "disetujui")}
                            style={{ padding: "6px 10px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                          >
                            Verifikasi
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "ditolak")}
                            style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteLaporan(item.id)}
                        style={{ padding: "6px 10px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default LaporanAkhir;