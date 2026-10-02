import { useState } from "react";

const PlacementPortal = () => {
  const [resume, setResume] = useState(null);

  const jobs = [
    {
      company: "TCS",
      role: "Software Engineer",
      package: "7 LPA"
    },
    {
      company: "Infosys",
      role: "System Engineer",
      package: "5 LPA"
    },
    {
      company: "Wipro",
      role: "Graduate Engineer Trainee",
      package: "4.5 LPA"
    }
  ];

  const handleResumeUpload = (e) => {
    setResume(e.target.files[0]);
  };

  const applyJob = (company) => {
    alert(`Applied successfully for ${company}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Placement Student Portal
        </h1>
        <p className="text-slate-500 mt-2">
          Upload resume, explore jobs and apply
        </p>
      </div>

      {/* Resume Upload */}
      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          Upload Resume / CV
        </h2>

        <input
          type="file"
          onChange={handleResumeUpload}
          className="block w-full border p-4 rounded-xl text-black"
        />

        {resume && (
          <p className="mt-4 text-green-600 font-medium">
            Uploaded: {resume.name}
          </p>
        )}
      </div>

      {/* Job Listings */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-800">
          Available Jobs
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="border rounded-2xl p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-slate-800">
                {job.company}
              </h3>

              <p className="text-slate-600 mt-2">
                Role: {job.role}
              </p>

              <p className="text-green-600 font-semibold mt-2">
                Package: {job.package}
              </p>

              <button
                onClick={() => applyJob(job.company)}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PlacementPortal;