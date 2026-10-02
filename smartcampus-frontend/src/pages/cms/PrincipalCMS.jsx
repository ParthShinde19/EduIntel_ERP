import { useState } from "react";
import API from "../../services/api";

const PrincipalCMS = () => {
  const [principal, setPrincipal] = useState({
    message: "",
    image: null
  });

  const savePrincipal = async () => {
    const formData = new FormData();
    formData.append("message", principal.message);
    formData.append("image", principal.image);

    await API.post("/content/principal", formData);

    alert("Principal content updated");
  };

  return (
    <div className="p-8">
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <textarea
          placeholder="Principal's Message"
          value={principal.message}
          onChange={(e) =>
            setPrincipal({
              ...principal,
              message: e.target.value
            })
          }
          className="w-full h-48 p-4 bg-white text-black border rounded-xl"
        />

        <input
          type="file"
          className="mt-4 w-full text-black"
          onChange={(e) =>
            setPrincipal({
              ...principal,
              image: e.target.files[0]
            })
          }
        />

        <button
          onClick={savePrincipal}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Save
        </button>

      </div>
    </div>
  );
};

export default PrincipalCMS;