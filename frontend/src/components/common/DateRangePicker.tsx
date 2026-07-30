import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onDateFrom: (val: string) => void;
  onDateTo: (val: string) => void;
  label?: string;
}

function parseDateStr(str: string): Date | null {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  label = "날짜",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(dateFrom);
  const [tempEnd, setTempEnd] = useState(dateTo);

  const initialViewDate = parseDateStr(dateFrom) || parseDateStr(dateTo) || new Date();
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth()); // 0-indexed

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStart(dateFrom);
    setTempEnd(dateTo);
  }, [dateFrom, dateTo]);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd("");
    } else if (tempStart && !tempEnd) {
      if (dateStr < tempStart) {
        setTempStart(dateStr);
        setTempEnd("");
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const handleApply = () => {
    onDateFrom(tempStart);
    onDateTo(tempEnd);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStart(dateFrom);
    setTempEnd(dateTo);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart("");
    setTempEnd("");
    onDateFrom("");
    onDateTo("");
    setIsOpen(false);
  };

  const renderMonthCalendar = (year: number, month: number) => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month filler days
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrent: false, dateStr: "" });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrent: true, dateStr });
    }

    // Next month filler days to complete grid rows
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrent: false, dateStr: "" });
    }

    return (
      <div className="w-64 select-none">
        <div className="mb-2 text-center text-sm font-semibold text-foreground">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((item, idx) => {
            if (!item.isCurrent) {
              return (
                <div key={idx} className="h-8 w-8 leading-8 text-muted-foreground/30">
                  {item.day}
                </div>
              );
            }

            const isSelectedStart = tempStart === item.dateStr;
            const isSelectedEnd = tempEnd === item.dateStr;
            const isInRange =
              tempStart &&
              tempEnd &&
              item.dateStr >= tempStart &&
              item.dateStr <= tempEnd;

            let bgClass = "hover:bg-secondary text-foreground rounded-md";

            if (isSelectedStart || isSelectedEnd) {
              bgClass = "bg-primary text-primary-foreground font-semibold rounded-md shadow-sm";
            } else if (isInRange) {
              bgClass = "bg-sky-100 text-sky-900 font-medium dark:bg-sky-950 dark:text-sky-200";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(item.dateStr)}
                className={`h-8 w-8 leading-8 transition-colors ${bgClass}`}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;

  const displayString =
    dateFrom && dateTo
      ? `${dateFrom} - ${dateTo}`
      : dateFrom
      ? `${dateFrom} -`
      : dateTo
      ? `- ${dateTo}`
      : "날짜 범위 선택";

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-secondary/60 px-3 text-xs font-medium text-foreground transition hover:border-ring"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
          <span className={!dateFrom && !dateTo ? "text-muted-foreground" : ""}>
            {displayString}
          </span>
        </div>

        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-[120] mt-2 rounded-xl border border-border bg-popover p-4 shadow-2xl backdrop-blur-md">
          {/* Top Header Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
                <CalendarIcon size={13} className="text-muted-foreground" />
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="bg-transparent text-xs text-foreground outline-none"
                />
              </div>
              <span className="text-xs text-muted-foreground">~</span>
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
                <CalendarIcon size={13} className="text-muted-foreground" />
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="bg-transparent text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Dual Month Calendar View */}
          <div className="relative flex flex-col gap-6 sm:flex-row">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="absolute left-0 top-0.5 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="absolute right-0 top-0.5 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={15} />
            </button>

            {renderMonthCalendar(viewYear, viewMonth)}
            {renderMonthCalendar(nextMonthYear, nextMonth)}
          </div>
        </div>
      )}
    </div>
  );
}
