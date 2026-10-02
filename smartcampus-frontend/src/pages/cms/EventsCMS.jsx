import { useEffect, useState } from "react";
import API from "../../services/api";

const EventsCMS = () => {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    registration_link: "",
    event_date: "",
    due_date: "",
    contact_name: "",
    contact_details: "",
    image: null
  });

  const [events, setEvents] = useState([]);

  const inputStyle =
    "w-full p-4 bg-white text-slate-900 placeholder-slate-500 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500";

  const fetchEvents = async () => {
  try {
    const res = await API.get("/events/all");
    setEvents(res.data.events);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value
    });
  };

  const handleImage = (e) => {
    setEventData({
      ...eventData,
      image: e.target.files[0]
    });
  };

  const createEvent = async () => {
    try {
      const formData = new FormData();

      Object.keys(eventData).forEach((key) => {
        formData.append(key, eventData[key]);
      });

      await API.post("/events/add", formData);

      alert("Event created successfully");

      setEventData({
        title: "",
        description: "",
        registration_link: "",
        event_date: "",
        due_date: "",
        contact_name: "",
        contact_details: "",
        image: null
      });

      fetchEvents();
    } catch (err) {
      console.log(err);
      alert("Failed to create event");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await API.delete(`/events/delete/${id}`);

      alert("Event deleted");

      fetchEvents();
    } catch (err) {
      console.log(err);
    }
  };

  const isRegistrationClosed = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Add Event */}
      <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Manage Events
        </h1>

        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          placeholder="Event Title"
          className={inputStyle}
        />

        <textarea
          name="description"
          value={eventData.description}
          onChange={handleChange}
          placeholder="Event Description"
          className={`${inputStyle} h-40 mt-4`}
        />

        <input
          type="url"
          name="registration_link"
          value={eventData.registration_link}
          onChange={handleChange}
          placeholder="Registration Link"
          className={`${inputStyle} mt-4`}
        />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            name="event_date"
            value={eventData.event_date}
            onChange={handleChange}
            className={inputStyle}
          />

          <input
            type="date"
            name="due_date"
            value={eventData.due_date}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        <input
          type="text"
          name="contact_name"
          value={eventData.contact_name}
          onChange={handleChange}
          placeholder="Contact Person Name"
          className={`${inputStyle} mt-4`}
        />

        <input
          type="text"
          name="contact_details"
          value={eventData.contact_details}
          onChange={handleChange}
          placeholder="Phone / Email / Offline Registration Details"
          className={`${inputStyle} mt-4`}
        />

        <input
          type="file"
          onChange={handleImage}
          className={`${inputStyle} mt-4`}
        />

        <button
          onClick={createEvent}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          Post Event
        </button>
      </div>

      {/* Existing Events */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Posted Events
        </h2>

        {events.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="border rounded-xl overflow-hidden shadow-sm"
              >
                {event.image && (
                  <img
                    src={`http://localhost:5000/${event.image}`}
                    alt={event.title}
                    className="w-full h-56 object-cover"
                  />
                )}

                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {event.title}
                  </h3>

                  <p className="text-slate-600 mt-2">
                    {event.description}
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    Event Date: {event.event_date}
                  </p>

                  <p className="text-sm text-slate-700">
                    Registration Due: {event.due_date}
                  </p>

                  <p className="text-sm text-slate-700 mt-2">
                    Contact: {event.contact_name} ({event.contact_details})
                  </p>

                  {!isRegistrationClosed(event.due_date) ? (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Register Now
                    </a>
                  ) : (
                    <div className="mt-4 text-red-600 font-semibold">
                      Registrations closed. Try offline registration.
                    </div>
                  )}

                  <button
                    onClick={() => deleteEvent(event._id)}
                    className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No events posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventsCMS;