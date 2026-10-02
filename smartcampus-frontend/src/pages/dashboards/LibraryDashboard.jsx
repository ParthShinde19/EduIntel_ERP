import { useEffect, useState } from "react";
import API from "../../services/api";

const LibraryDashboard = () => {
  const [books, setBooks] = useState([]);
  const [borrowForm, setBorrowForm] = useState({
    student_id: "",
    book_id: "",
    due_date: ""
  });

  const role = localStorage.getItem("role");

  if (role !== "library_admin") {
    return (
      <div className="text-white p-10">
        Unauthorized Access
      </div>
    );
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await API.get("/library/books");
      setBooks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setBorrowForm({
      ...borrowForm,
      [e.target.name]: e.target.value
    });
  };

  const borrowBook = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        "/library/borrow",
        borrowForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Book borrowed successfully");

      setBorrowForm({
        student_id: "",
        book_id: "",
        due_date: ""
      });

      fetchBooks();
    } catch (err) {
      alert(
        err.response?.data?.message || "Error borrowing book"
      );
    }
  };

  const returnBook = async (id) => {
    try {
      await API.put(
        `/library/return/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Book returned successfully");
      fetchBooks();
    } catch (err) {
      alert("Error returning book");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">
        Library Dashboard
      </h1>

      {/* Borrow Book Form */}
      <form
        onSubmit={borrowBook}
        className="bg-slate-900 p-6 rounded-xl mb-10 grid md:grid-cols-3 gap-4"
      >
        <input
          name="student_id"
          placeholder="Student ID"
          value={borrowForm.student_id}
          onChange={handleChange}
          className="p-3 rounded bg-slate-800"
        />

        <input
          name="book_id"
          placeholder="Book ID"
          value={borrowForm.book_id}
          onChange={handleChange}
          className="p-3 rounded bg-slate-800"
        />

        <input
          name="due_date"
          type="date"
          value={borrowForm.due_date}
          onChange={handleChange}
          className="p-3 rounded bg-slate-800"
        />

        <button
          type="submit"
          className="md:col-span-3 bg-green-600 p-3 rounded-lg font-semibold"
        >
          Borrow Book
        </button>
      </form>

      {/* Books List */}
      <div className="bg-slate-900 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">
          Books Inventory
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-2">Book</th>
                <th>Author</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {books.map((b) => (
                <tr
                  key={b._id}
                  className="border-b border-slate-800"
                >
                  <td className="p-2">{b.book_name}</td>
                  <td>{b.author_name}</td>
                  <td>{b.available_copies}</td>
                  <td>
                    <button
                      onClick={() =>
                        returnBook(b._id)
                      }
                      className="bg-blue-600 px-3 py-1 rounded"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;