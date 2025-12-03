// components/ward/UnifiedDataTable.js
"use client";

import { useState, useMemo, useCallback } from "react";
import { Table, TableHeader, TableCell } from "components/shared/table";
import { FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from "react-icons/fi";
import styles from "styles/tabs/road.module.css";

export default function UnifiedDataTable({
  data = [],
  dataType, // 'roads', 'junctions', 'mapillary'
  selectedItem,
  onSelectItem,
  columns,
  itemsPerPage = 12,
  getItemType
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      columns.some(col => 
        String(item[col.key] || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageInput = useCallback((e) => {
    let val = Number(e.target.value);
    if (isNaN(val)) return;
    if (val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setCurrentPage(val);
  }, [totalPages]);

  const handleRowClick = useCallback((item) => {
    onSelectItem(item);
  }, [onSelectItem]);

  const isItemSelected = useCallback((item) => {
    if (!selectedItem) return false;
    
    const currentType = getItemType ? getItemType(dataType) : dataType;
    const selectedType = selectedItem.type;
    
    // Check if types match
    if (currentType !== selectedType) return false;
    
    // Check if IDs match (fid for roads/junctions, id for mapillary)
    if (dataType === 'mapillary') {
      return selectedItem.id === item.id;
    }
    return selectedItem.fid === item.fid;
  }, [selectedItem, dataType, getItemType]);

  if (!data || data.length === 0) {
    return <p className={styles.empty}>No {dataType} found.</p>;
  }

  return (
    <div>
      {/* Search (add if needed) */}
      {/* <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={`Search ${dataType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div> */}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <Table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <TableHeader key={col.key} width={col.width}>
                  {col.label}
                </TableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const isSelected = isItemSelected(item);
              
              return (
                <tr
                  key={item.fid || item.id || index}
                  className={`${styles.clickableRow} ${
                    isSelected ? styles.selectedRow : ""
                  }`}
                  onClick={() => handleRowClick(item)}
                >
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(item) : item[col.key]}
                    </TableCell>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button
            className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ""}`}
            onClick={() => currentPage > 1 && setCurrentPage(1)}
            disabled={currentPage === 1}
            title="First Page"
          >
            <FiChevronsLeft />
          </button>
          <button
            className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ""}`}
            onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
          >
            <FiChevronLeft />
          </button>
          <span className={styles.pageInputWrapper}>
            <span className={styles.pageInputLabel}>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              className={styles.pageInput}
            />
            <span className={styles.pageInputLabel}>of</span>
            <span className={styles.pageInputNumber}>{totalPages}</span>
          </span>
          <button
            className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ""}`}
            onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
          >
            <FiChevronRight />
          </button>
          <button
            className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ""}`}
            onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
    </div>
  );
}