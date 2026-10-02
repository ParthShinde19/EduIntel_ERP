import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events/live");
      setEvents(res.data.events || []);
    } catch (err) {
      console.log(err);
    }
  };

  const isRegistrationClosed = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* College Branding Section */}
      <section className="w-full py-10 px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Left Logo */}
          <img
            src="/assets/w_logo.png"
            alt="WIET Logo"
            className="w-24 h-24 object-contain"
          />

          {/* Center Title */}
          <div className="text-center flex-1 px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Watumull Institute of
            </h1>

            <h2 className="text-2xl md:text-4xl font-semibold text-blue-500 whitespace-nowrap">
              Engineering & Technology
            </h2>

            <p className="mt-3 text-slate-400 text-lg">
              College Events & Registrations
            </p>
          </div>

          {/* Right Logo */}
          <img
            src="/assets/hsnc.png"
            alt="HSNC Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
      </section>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto p-8">

        {events.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">

            {events.map((event) => (
              <div
                key={event._id}
                className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden"
              >
                {event.image && (
                  <img
                    src={`http://localhost:5000/${event.image}`}
                    alt={event.title}
                    className="w-full h-60 object-cover"
                  />
                )}

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {event.title}
                  </h2>

                  <p className="text-slate-300 leading-7 mb-4">
                    {event.description}
                  </p>

                  <p className="text-slate-400 text-sm">
                    Event Date:{" "}
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>

                  <p className="text-slate-400 text-sm mb-3">
                    Registration Due:{" "}
                    {new Date(event.due_date).toLocaleDateString()}
                  </p>

                  <p className="text-slate-300 text-sm mb-4">
                    Contact: {event.contact_name} ({event.contact_details})
                  </p>

                  {!isRegistrationClosed(event.due_date) ? (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
                    >
                      Register Now
                    </a>
                  ) : (
                    <div className="text-red-500 font-semibold">
                      Registrations Closed. Try Offline Registration.
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xl">
            No live events available right now.
          </div>
        )}

      </div>
    </div>
  );
};

export default Events;
