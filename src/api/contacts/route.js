async function handler({ method, body, query }) {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  switch (method) {
    case "GET": {
      const contacts = await sql`
        SELECT c.*, u.name, u.email, u.image
        FROM contacts c
        JOIN auth_users u ON c.contact_id = u.id
        WHERE c.user_id = ${session.user.id}
        ORDER BY c.created_at DESC
      `;
      return { contacts };
    }

    case "POST": {
      const { contact_id, relationship } = body;
      if (!contact_id || !relationship) {
        return { error: "Missing required fields", status: 400 };
      }

      try {
        const contact = await sql`
          INSERT INTO contacts (user_id, contact_id, relationship)
          VALUES (${session.user.id}, ${contact_id}, ${relationship})
          RETURNING *
        `;
        return { contact: contact[0] };
      } catch (error) {
        if (error.code === "23505") {
          return { error: "Contact already exists", status: 400 };
        }
        return { error: "Failed to create contact", status: 500 };
      }
    }

    case "PUT": {
      const { contact_id, relationship } = body;
      if (!contact_id || !relationship) {
        return { error: "Missing required fields", status: 400 };
      }

      const contact = await sql`
        UPDATE contacts
        SET relationship = ${relationship}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${session.user.id} AND contact_id = ${contact_id}
        RETURNING *
      `;

      if (contact.length === 0) {
        return { error: "Contact not found", status: 404 };
      }

      return { contact: contact[0] };
    }

    case "DELETE": {
      const { contact_id } = query;
      if (!contact_id) {
        return { error: "Missing contact_id", status: 400 };
      }

      await sql`
        DELETE FROM contacts
        WHERE user_id = ${session.user.id} AND contact_id = ${contact_id}
      `;

      return { success: true };
    }

    default:
      return { error: "Method not allowed", status: 405 };
  }
}
export async function POST(request) {
  return handler(await request.json());
}