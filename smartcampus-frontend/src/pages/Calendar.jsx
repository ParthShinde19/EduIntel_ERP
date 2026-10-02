import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6, 1)); // Anchor standard views starting July 2025
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const res = await API.get("/calendar/all");
      const documents = res.data.calendars || [];
      
      const mergedTimelines = documents.reduce((acc, doc) => {
        return acc.concat(doc.important_dates || []);
      }, []);

      // Filter out duplicate entries and parse dates once to optimize memory
      const uniqueEventsMap = {};
      mergedTimelines.forEach(event => {
        // Enforce parsing safely using UTC values to insulate against timezone shifting bugs
        const dateObj = new Date(event.event_date);
        const yyyy = dateObj.getUTCFullYear();
        const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getUTCDate()).padStart(2, '0');
        const normalizedDateStr = `${yyyy}-${mm}-${dd}`;

        const uniqueKey = `${normalizedDateStr}_${event.title}`;
        
        uniqueEventsMap[uniqueKey] = {
          ...event,
          parsedDate: new Date(yyyy, dateObj.getUTCMonth(), dateObj.getUTCDate()) // Saved locally relative to user environment
        };
      });

      const cleanUniqueEvents = Object.values(uniqueEventsMap);
      setEvents(cleanUniqueEvents);

      // Snap focus to the start date of the first parsed event in the array
      if (cleanUniqueEvents.length > 0) {
        const sortedDates = [...cleanUniqueEvents].sort((a, b) => a.parsedDate - b.parsedDate);
        const firstEventDate = sortedDates[0].parsedDate;
        setCurrentMonth(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
      }
    } catch (err) {
      console.error("Error pulling unified calendar timeline data stream:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daySquares = [];
  for (let i = 0; i < firstDayIndex; i++) daySquares.push(null);
  for (let d = 1; d <= totalDays; d++) daySquares.push(new Date(year, month, d));

  // Quick lookup comparison using pre-calculated date properties
  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(e => 
      e.parsedDate.getDate() === date.getDate() &&
      e.parsedDate.getMonth() === date.getMonth() &&
      e.parsedDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <section className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Navigation bar controls */}
        <div className="flex items-center justify-between mb-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={handlePrevMonth} 
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200"
          >
            &larr; Prev
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 uppercase tracking-wide">
            {currentMonth.toLocaleString("default", { month: "long" })} {year}
          </h2>
          <button 
            onClick={handleNextMonth} 
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200"
          >
            Next &rarr;
          </button>
        </div>

        {/* 7 Day Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-slate-400 font-bold mb-4 uppercase text-xs tracking-widest">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-2 bg-slate-900/40 rounded-lg">{day}</div>
          ))}
        </div>

        {/* Master Month View Blocks */}
        {loading ? (
          <div className="text-center py-24 text-slate-400 text-lg animate-pulse">
            Syncing Master Timelines...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {daySquares.map((date, idx) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div 
                  key={idx} 
                  className={`min-h-[130px] p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    date 
                      ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-950/20" 
                      : "bg-transparent border-transparent pointer-events-none"
                  }`}
                >
                  {date && (
                    <>
                      <span className="text-sm font-bold text-slate-400 block mb-1.5 select-none">
                        {date.getDate()}
                      </span>
                      <div className="space-y-1 flex-1 overflow-y-auto scrollbar-none max-h-[90px]">
                        {dayEvents.map((ev, eIdx) => (
                          <div
                            key={ev._id || eIdx}
                            title={`${ev.title}${ev.description ? ` - ${ev.description}` : ""}`}
                            className={`text-[10px] p-1.5 rounded-lg font-semibold truncate transition duration-150 border cursor-help ${
                              ev.category === "Holiday" 
                                ? "bg-red-950/80 text-red-400 border-red-900/50" 
                                : ev.category === "Weekoff" 
                                  ? "bg-amber-950/60 text-amber-500 border-amber-900/30" 
                                  : "bg-blue-950/80 text-blue-400 border-blue-900/50"
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Calendar;