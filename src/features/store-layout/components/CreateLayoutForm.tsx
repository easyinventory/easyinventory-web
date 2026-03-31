import { useState } from "react";
import "./CreateLayoutForm.css";

interface CreateLayoutFormProps {
  onSubmit: (rows: number, cols: number) => void;
  isLoading: boolean;
  error?: string | null;
}

function validateDimension(value: number): string | null {
  if (isNaN(value) || value < 2) return "Minimum value is 2.";
  if (value > 30) return "Maximum value is 30.";
  return null;
}

export default function CreateLayoutForm({
  onSubmit,
  isLoading,
  error,
}: CreateLayoutFormProps) {
  const [rows, setRows] = useState<string>("5");
  const [cols, setCols] = useState<string>("8");
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [colsError, setColsError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRows = parseInt(rows, 10);
    const parsedCols = parseInt(cols, 10);
    const re = validateDimension(parsedRows);
    const ce = validateDimension(parsedCols);
    setRowsError(re);
    setColsError(ce);
    if (re || ce) return;
    onSubmit(parsedRows, parsedCols);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRows(e.target.value);
    setRowsError(validateDimension(parseInt(e.target.value, 10)));
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCols(e.target.value);
    setColsError(validateDimension(parseInt(e.target.value, 10)));
  };

  return (
    <div className="create-layout-form">
      <div className="create-layout-form__title">New layout version</div>
      <form onSubmit={handleSubmit}>
        <div className="create-layout-form__row">
          <div className="create-layout-form__field">
            <label htmlFor="layout-rows">Rows</label>
            <input
              id="layout-rows"
              type="number"
              min={2}
              max={30}
              value={rows}
              onChange={handleRowsChange}
              required
            />
            {rowsError && (
              <span className="create-layout-form__field-error">{rowsError}</span>
            )}
          </div>
          <div className="create-layout-form__field">
            <label htmlFor="layout-cols">Columns</label>
            <input
              id="layout-cols"
              type="number"
              min={2}
              max={30}
              value={cols}
              onChange={handleColsChange}
              required
            />
            {colsError && (
              <span className="create-layout-form__field-error">{colsError}</span>
            )}
          </div>
          <button
            type="submit"
            className="create-layout-form__submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create layout"}
          </button>
        </div>
        <p className="create-layout-form__hint">
          Grid dimensions can be 2–30 rows and 2–30 columns. New layouts are
          activated immediately.
        </p>
        {error && <div className="create-layout-form__error">{error}</div>}
      </form>
    </div>
  );
}
