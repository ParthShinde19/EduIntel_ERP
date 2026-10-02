import { useState, useEffect } from "react";
import API from "../services/api";

const Library = () => {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);

  const [bookForm, setBookForm] = useState({
    book_name: "",
    author_name: "",
    published_year: "",
    edition: "",
    total_copies: "",
    category: ""
  });

  const [issueForm, setIssueForm] = useState({
    student_id: "",
    book_id: "",
    due_date: ""
  });

  useEffect(() => {
    fetchBooks();
    fetchStudents();
    fetchIssuedBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await API.get("/books/all");
      setBooks(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students/all");
      setStudents(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const res = await API.get("/issues/all");
      setIssuedBooks(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleBookChange = (e) => {
    setBookForm({ ...bookForm, [e.target.name]: e.target.value });
  };

  const handleIssueChange = (e) => {
    setIssueForm({ ...issueForm, [e.target.name]: e.target.value });
  };

  const addBook = async (e) => {
    e.preventDefault();

    try {
      await API.post("/books/add", {
        ...bookForm,
        available_copies: Number(bookForm.total_copies)
      });

      fetchBooks();

      setBookForm({
        book_name: "",
        author_name: "",
        published_year: "",
        edition: "",
        total_copies: "",
        category: ""
      });
    } catch (err) {
      console.log(err);
    }
  };

  const issueBook = async (e) => {
    e.preventDefault();

    try {
      await API.post("/issues/issue", issueForm);

      fetchBooks();
      fetchIssuedBooks();

      setIssueForm({
        student_id: "",
        book_id: "",
        due_date: ""
      });
    } catch (err) {
      console.log(err);
    }
  };

  const returnBook = async (id) => {
    try {
      await API.put(`/issues/return/${id}`);

      fetchBooks();
      fetchIssuedBooks();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold">Library Admin</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Smart Campus System
        </p>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">

        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-md border p-8 mb-8">
          <h2 className="text-4xl font-bold text-slate-900">
            Library Dashboard
          </h2>
          <p className="text-slate-600 mt-2">
            Manage books, issue records and students
          </p>
        </div>

        {/* ADD BOOK */}
        <div className="bg-white rounded-3xl shadow-md border p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6">Add Book</h3>

          <form onSubmit={addBook} className="grid md:grid-cols-3 gap-5">

            {Object.keys(bookForm).map((field) => (
              <input
                key={field}
                name={field}
                value={bookForm[field]}
                onChange={handleBookChange}
                placeholder={field.replace(/_/g, " ")}
                className="p-4 border rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            ))}

            <button className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-semibold">
              Add Book
            </button>
          </form>
        </div>

        {/* ISSUE BOOK */}
        <div className="bg-white rounded-3xl shadow-md border p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6">Issue Book</h3>

          <form onSubmit={issueBook} className="grid md:grid-cols-3 gap-5">

            <select
              name="student_id"
              value={issueForm.student_id}
              onChange={handleIssueChange}
              className="p-4 border rounded-xl text-slate-900"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.first_name} {s.surname}
                </option>
              ))}
            </select>

            <select
              name="book_id"
              value={issueForm.book_id}
              onChange={handleIssueChange}
              className="p-4 border rounded-xl text-slate-900"
            >
              <option value="">Select Book</option>
              {books.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.book_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="due_date"
              value={issueForm.due_date}
              onChange={handleIssueChange}
              className="p-4 border rounded-xl text-slate-900"
            />

            <button className="md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold">
              Issue Book
            </button>

          </form>
        </div>

        {/* ISSUED BOOKS */}
        <div className="bg-white rounded-3xl shadow-md border p-8">

          <h3 className="text-2xl font-bold mb-6">
            Issued Books
          </h3>

          <table className="w-full">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Student</th>
                <th>Book</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {issuedBooks.map((r) => (
                <tr key={r._id} className="border-b">

                  <td className="py-5">
                    {r.student_id?.first_name} {r.student_id?.surname}
                  </td>

                  <td>{r.book_id?.book_name}</td>

                  <td>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                      {r.status}
                    </span>
                  </td>

                  <td>
                    {new Date(r.due_date).toLocaleDateString()}
                  </td>

                  <td>
                    {r.status === "Issued" && (
                      <button
                        onClick={() => returnBook(r._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
                      >
                        Return
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </main>
    </div>
  );
};

export default Library;