async function handler({ method, receiver_id, content, is_stamp }) {
  const session = getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const sender_id = session.user.id;

  if (method === "GET") {
    const messages = await sql`
      SELECT m.*, au.name as sender_name, au2.name as receiver_name 
      FROM messages m
      JOIN auth_users au ON m.sender_id = au.id
      JOIN auth_users au2 ON m.receiver_id = au2.id
      WHERE (m.sender_id = ${sender_id} AND m.receiver_id = ${receiver_id})
      OR (m.sender_id = ${receiver_id} AND m.receiver_id = ${sender_id})
      ORDER BY m.created_at ASC
    `;
    return { messages };
  }

  if (method === "POST") {
    if (!content) {
      return { error: "Content is required", status: 400 };
    }

    const relationship = await sql`
      SELECT relationship 
      FROM contacts 
      WHERE user_id = ${sender_id} 
      AND contact_id = ${receiver_id}
    `;

    if (!relationship.length) {
      return { error: "Contact relationship not found", status: 400 };
    }

    let rewritten_content = content;

    if (!is_stamp) {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `あなたは日本語のメッセージを、送信者と受信者の関係性に基づいて最適化するAIです。
              関係性は「${relationship[0].relationship}」です。
              元のメッセージの意図や感情は保持しながら、関係性に応じた適切な表現に書き換えてください。
              結果は書き換えたメッセージのみを返してください。`,
            },
            {
              role: "user",
              content: content,
            },
          ],
        }),
      });

      const result = await response.json();
      rewritten_content = result.choices[0].message.content;
    }

    const message = await sql`
      INSERT INTO messages (
        sender_id,
        receiver_id,
        original_content,
        rewritten_content,
        is_stamp
      )
      VALUES (
        ${sender_id},
        ${receiver_id},
        ${content},
        ${rewritten_content},
        ${is_stamp}
      )
      RETURNING *
    `;

    return { message: message[0] };
  }

  return { error: "Method not allowed", status: 405 };
}
export async function POST(request) {
  return handler(await request.json());
}