"use client";
import React from "react";

function MainComponent() {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactRelationship, setNewContactRelationship] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: user, loading: userLoading } = useUser();

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      setError("Could not load contacts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: newContactEmail,
          relationship: newContactRelationship,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add contact");
      }
      await fetchContacts();
      setNewContactEmail("");
      setNewContactRelationship("");
      setShowAddForm(false);
    } catch (error) {
      setError("Could not add contact");
      console.error(error);
    }
  };

  const handleUpdateRelationship = async (contactId, newRelationship) => {
    setError(null);
    try {
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contactId,
          relationship: newRelationship,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update contact");
      }
      await fetchContacts();
    } catch (error) {
      setError("Could not update contact");
      console.error(error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    setError(null);
    try {
      const response = await fetch(`/api/contacts?contact_id=${contactId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }
      await fetchContacts();
    } catch (error) {
      setError("Could not delete contact");
      console.error(error);
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl text-gray-600">
            Please sign in to continue
          </p>
          <a
            href="/account/signin"
            className="rounded-lg bg-[#357AFF] px-6 py-3 text-white hover:bg-[#2E69DE]"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Contacts
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-[#357AFF] px-4 py-2 text-white hover:bg-[#2E69DE]"
          >
            {showAddForm ? "Cancel" : "Add Contact"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-500">
            {error}
          </div>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddContact}
            className="mb-8 rounded-lg bg-white p-6 shadow-md"
          >
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Relationship
              </label>
              <select
                value={newContactRelationship}
                onChange={(e) => setNewContactRelationship(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
                required
              >
                <option value="">Select relationship</option>
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="acquaintance">Acquaintance</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#357AFF] py-2 text-white hover:bg-[#2E69DE]"
            >
              Add Contact
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center text-gray-600">No contacts found</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact) => (
              <div
                key={contact.contact_id}
                className="rounded-lg bg-white p-6 shadow-md"
              >
                <div className="mb-4 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200">
                    {contact.image && (
                      <img
                        src={contact.image}
                        alt={contact.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <select
                    value={contact.relationship}
                    onChange={(e) =>
                      handleUpdateRelationship(
                        contact.contact_id,
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
                  >
                    <option value="family">Family</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="acquaintance">Acquaintance</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <a
                    href={`/messaging?contact=${contact.contact_id}`}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                  >
                    Message
                  </a>
                  <button
                    onClick={() => handleDeleteContact(contact.contact_id)}
                    className="rounded-lg bg-red-50 px-4 py-2 text-red-500 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;