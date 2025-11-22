import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import "./App.css";

const TAXES_API = "https://685013d7e7c42cfd17974a33.mockapi.io/taxes";
const COUNTRIES_API = "https://685013d7e7c42cfd17974a33.mockapi.io/countries";

const columnHelper = createColumnHelper();

function formatDate(dateString) {
  if (!dateString) return "-";
  const d1 = new Date(dateString);
  if (!isNaN(d1.getTime())) {
    return d1.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const parts = dateString.split(/[-/]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (year.length === 2) year = "20" + year;
    const iso = `${year}-${month}-${day}`;
    const d2 = new Date(iso);
    if (!isNaN(d2.getTime())) {
      return d2.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return "-";
}

function App() {
  const [taxes, setTaxes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [showCountryFilter, setShowCountryFilter] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const countryFieldRef = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        axios.get(TAXES_API),
        axios.get(COUNTRIES_API),
      ]);
      setTaxes(tRes.data);
      setCountries(cRes.data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const closeAll = () => {
      setShowCountryFilter(false);
      setShowCountryDropdown(false);
    };
    if (showCountryFilter || showCountryDropdown) {
      window.addEventListener("click", closeAll);
    }
    return () => window.removeEventListener("click", closeAll);
  }, [showCountryFilter, showCountryDropdown]);

  const countriesByName = useMemo(() => {
    const map = {};
    countries.forEach((c) => (map[c.name] = c));
    return map;
  }, [countries]);

  const filteredTaxes = useMemo(() => {
    if (!selectedCountries.length) return taxes;
    return taxes.filter((t) => selectedCountries.includes(t.country || ""));
  }, [selectedCountries, taxes]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Entity",
        cell: (info) => (
          <button className="entity-link">{info.getValue() || "-"}</button>
        ),
      }),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: (info) => <GenderBadge gender={info.getValue()} />,
      }),
      columnHelper.accessor("requestDate", {
        header: "Request Date",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("country", {
        header: () => (
          <div className="country-header">
            Country
            <button
              className="filter-icon-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCountryFilter((prev) => !prev);
              }}
            >
              ⏷
            </button>
          </div>
        ),
        cell: (info) => info.getValue() || "-",
      }),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button className="edit-icon" onClick={() => setEditRow(row.original)}>
            ✏️
          </button>
        ),
      },
    ],
    [showCountryFilter]
  );

  const table = useReactTable({
    data: filteredTaxes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function toggleCountry(name) {
    setSelectedCountries((prev) =>
      prev.includes(name)
        ? prev.filter((c) => c !== name)
        : [...prev, name]
    );
  }

  function handleClose() {
    setEditRow(null);
    setError("");
    setShowCountryDropdown(false);
  }

  function handleChange(field, value) {
    setEditRow((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!editRow.name.trim()) return setError("Name is required");
    if (!editRow.country.trim()) return setError("Country is required");

    const countryObj = countriesByName[editRow.country];
    const original = taxes.find((t) => t.id === editRow.id) || {};

    const payload = {
      ...original,
      ...editRow,
      ...(countryObj ? { countryId: countryObj.id } : {}),
    };

    setSaving(true);
    const res = await axios.put(`${TAXES_API}/${editRow.id}`, payload);
    setTaxes((prev) =>
      prev.map((t) => (t.id === editRow.id ? res.data : t))
    );
    setSaving(false);
    handleClose();
  }

  function handleCountryFieldClick(e) {
    e.stopPropagation();
    setShowCountryDropdown((prev) => !prev);

    const rect = countryFieldRef.current.getBoundingClientRect();

    setDropdownPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }

  function handleSelectCountry(name) {
    handleChange("country", name);
    setShowCountryDropdown(false);
  }

  return (
    <div className="page-root">
      <div className="card">
        {loading ? (
          <div className="state-message">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="tax-table">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id}>
                        {flexRender(
                          h.column.columnDef.header,
                          h.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {showCountryFilter && (
              <div
                className="country-filter-popover"
                onClick={(e) => e.stopPropagation()}
              >
                {Array.from(new Set(taxes.map((t) => t.country))).map(
                  (c) => (
                    <label key={c} className="filter-row">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(c)}
                        onChange={() => toggleCountry(c)}
                      />
                      {c}
                    </label>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {editRow && (
        <div className="modal-backdrop">
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <header className="modal-header">
              <h2>Edit Customer</h2>
              <button className="close-btn" onClick={handleClose}>
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="form-group">
                <div className="field-label-row">
                  <span>Name</span>
                  <span className="required-star">*</span>
                </div>
                <input
                  value={editRow.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <span className="field-label">Country</span>
                <div className="country-select-wrapper">
                  <div
                    ref={countryFieldRef}
                    className={
                      "country-select-field" +
                      (showCountryDropdown ? " active" : "") +
                      (editRow.country ? " has-value" : "")
                    }
                    onClick={handleCountryFieldClick}
                  >
                    <span className="country-select-value">
                      {editRow.country || ""}
                    </span>
                    <span className="country-select-chevron">▾</span>
                  </div>
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}
            </div>

            <footer className="modal-footer">
              <button className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="save-btn"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {showCountryDropdown && (
        <div
          className="country-list-popover"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            position: "fixed",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {countries.map((c) => (
            <div
              key={c.id}
              className="country-list-row"
              onClick={() => handleSelectCountry(c.name)}
            >
              <span className="country-list-icon">
                <svg viewBox="0 0 24 24" className="icon-svg">
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 4.077 4.395 9.36 5.597 10.735.213.24.593.24.806 0C13.605 17.36 18 12.077 18 8c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
              </span>
              <span className="country-list-name">{c.name}</span>
              <span className="country-list-edit-icon">
                <svg viewBox="0 0 24 24" className="icon-svg">
                  <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25zm14.71-9.46a1 1 0 0 0 0-1.41l-1.59-1.59a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.38-1.38z" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenderBadge({ gender }) {
  if (!gender) return "-";
  const g = gender.toLowerCase();
  return (
    <span
      className={`gender-badge ${
        g === "male" ? "gender-male" : "gender-female"
      }`}
    >
      {gender}
    </span>
  );
}

export default App;
