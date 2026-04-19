import React, { useState, useMemo, useCallback } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, X, CalendarDays, Clock, Save } from 'lucide-react';

// --- Zod Schema ---
const timeConfigSchema = z.object({
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  excludedDates: z.array(z.string()),
});

type TimeConfigValues = z.infer<typeof timeConfigSchema>;

// --- Helpers ---
function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// --- Interactive Calendar Component ---
interface CalendarProps {
  startDate: string;
  endDate: string;
  excludedDates: string[];
  onToggleDate: (dateStr: string) => void;
}

const InteractiveCalendar: React.FC<CalendarProps> = ({ startDate, endDate, excludedDates, onToggleDate }) => {
  const initialMonth = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const start = useMemo(() => startDate ? new Date(startDate + 'T00:00:00') : null, [startDate]);
  const end = useMemo(() => endDate ? new Date(endDate + 'T00:00:00') : null, [endDate]);

  const days = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isInRange = useCallback((d: Date) => {
    if (!start || !end) return false;
    return d >= start && d <= end;
  }, [start, end]);

  const isExcluded = useCallback((d: Date) => {
    return excludedDates.includes(toDateStr(d));
  }, [excludedDates]);

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const firstDayOfWeek = days.length > 0 ? days[0].getDay() : 0;

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-gray-700 capitalize">{monthLabel}</span>
        <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map(label => (
          <div key={label} className="text-center text-[10px] font-bold text-gray-400 py-1.5 uppercase tracking-wider">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}

        {days.map(day => {
          const dateStr = toDateStr(day);
          const inRange = isInRange(day);
          const excluded = isExcluded(day);
          const weekend = isWeekend(day);
          const isStart = start && isSameDay(day, start);
          const isEnd = end && isSameDay(day, end);

          let cellClass = 'h-10 w-full flex items-center justify-center text-xs rounded-lg transition-all duration-150 font-medium ';

          if (!inRange) {
            cellClass += 'text-gray-300 cursor-default';
          } else if (excluded) {
            cellClass += 'bg-red-50 text-red-400 line-through cursor-pointer hover:bg-red-100 border border-red-200';
          } else if (isStart || isEnd) {
            cellClass += 'bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700 shadow-sm';
          } else if (weekend) {
            cellClass += 'bg-orange-50 text-orange-500 cursor-pointer hover:bg-orange-100 border border-orange-200';
          } else {
            cellClass += 'bg-blue-50/50 text-gray-700 cursor-pointer hover:bg-blue-100 border border-blue-100';
          }

          return (
            <button
              key={dateStr}
              type="button"
              className={cellClass}
              disabled={!inRange}
              onClick={() => inRange && onToggleDate(dateStr)}
              title={
                excluded ? `${formatDateVN(dateStr)} — Ngày nghỉ (click để bỏ)` :
                  inRange ? `${formatDateVN(dateStr)} — Click để đánh dấu ngày nghỉ` : ''
              }
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Đầu/Cuối kỳ
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <span className="w-3 h-3 rounded bg-blue-50 border border-blue-100 inline-block" /> Ngày làm việc
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <span className="w-3 h-3 rounded bg-orange-50 border border-orange-200 inline-block" /> Cuối tuần
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block" /> Ngày nghỉ
        </span>
      </div>
    </div>
  );
};

// --- Main Form ---
export default function TimeSetupForm({ onSaved }: { onSaved?: () => void }) {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<TimeConfigValues>({
    resolver: zodResolver(timeConfigSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      excludedDates: [],
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const workingDaysInfo = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate + 'T00:00:00');
    const e = new Date(endDate + 'T00:00:00');
    if (s > e) return null;
    let totalDays = 0;
    const cur = new Date(s);
    while (cur <= e) {
      totalDays++;
      cur.setDate(cur.getDate() + 1);
    }
    return { totalDays };
  }, [startDate, endDate]);

  const onSubmit = (data: TimeConfigValues) => {
    const s = new Date(data.startDate + 'T00:00:00');
    const e = new Date(data.endDate + 'T00:00:00');
    let totalDays = 0;
    const cur = new Date(s);
    while (cur <= e) {
      totalDays++;
      cur.setDate(cur.getDate() + 1);
    }
    const workingDays = totalDays - data.excludedDates.length;
    const payload = { ...data, totalWorkingDays: workingDays };
    console.log("Cấu hình thời gian:", payload);
    alert("Đã cập nhật tiến độ! Xem console để biết chi tiết payload.");
    if (onSaved) onSaved();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-white">
        <h2 className="text-base font-bold text-gray-800">Cấu hình Tiến độ Thời gian</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
        {/* Start / End date pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ngày bắt đầu</label>
            <input 
              type="date" 
              {...register("startDate")} 
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white hover:border-gray-300"
            />
            {errors.startDate && <span className="text-red-500 text-xs mt-1 block">{errors.startDate.message}</span>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ngày kết thúc</label>
            <input 
              type="date" 
              {...register("endDate")} 
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white hover:border-gray-300"
            />
            {errors.endDate && <span className="text-red-500 text-xs mt-1 block">{errors.endDate.message}</span>}
          </div>
        </div>

        {/* Summary badge */}
        {startDate && endDate && workingDaysInfo && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <CalendarDays size={16} className="text-blue-500 shrink-0" />
            <div className="text-sm text-blue-700">
              <span className="font-semibold">{formatDateVN(startDate)}</span>
              <span className="mx-1.5 text-blue-400">→</span>
              <span className="font-semibold">{formatDateVN(endDate)}</span>
              <span className="ml-2 text-blue-400">({workingDaysInfo.totalDays} ngày)</span>
            </div>
          </div>
        )}

        {/* Interactive calendar */}
        {startDate && endDate && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quản lý ngày nghỉ</label>
            <p className="text-xs text-gray-400 mb-3">Click vào ngày trên lịch để đánh dấu / bỏ đánh dấu ngày nghỉ</p>
            <Controller
              name="excludedDates"
              control={control}
              render={({ field }) => {
                const excludedDates: string[] = field.value || [];
                const toggleDate = (dateStr: string) => {
                  if (excludedDates.includes(dateStr)) {
                    field.onChange(excludedDates.filter(d => d !== dateStr));
                  } else {
                    field.onChange([...excludedDates, dateStr].sort());
                  }
                };

                const s = new Date(startDate + 'T00:00:00');
                const e = new Date(endDate + 'T00:00:00');
                let totalDays = 0;
                const cur = new Date(s);
                while (cur <= e) {
                  totalDays++;
                  cur.setDate(cur.getDate() + 1);
                }
                const workingDays = totalDays - excludedDates.length;

                return (
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <InteractiveCalendar
                      startDate={startDate}
                      endDate={endDate}
                      excludedDates={excludedDates}
                      onToggleDate={toggleDate}
                    />

                    {/* Working days summary */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <div className="text-sm text-gray-500">
                        <span className="font-bold text-gray-800 text-base">{workingDays}</span>
                        <span className="ml-1">ngày làm việc</span>
                        {excludedDates.length > 0 && (
                          <span className="text-gray-400 ml-1.5">
                            ({totalDays} − {excludedDates.length} ngày nghỉ)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Excluded date chips */}
                    {excludedDates.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Ngày nghỉ đã chọn:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedDates.map(dateStr => (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => toggleDate(dateStr)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500 font-medium hover:bg-red-100 transition-all duration-150"
                            >
                              {formatDateVN(dateStr)}
                              <X size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button 
            type="submit" 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
          >
            <Save size={14} />
            Cập nhật Tiến độ
          </button>
        </div>
      </form>
    </div>
  );
}
