"use client";
import React from "react";

function MainComponent() {
  const { data: user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">Tone</div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <a
                    href="/messaging"
                    className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Messages
                  </a>
                  <a
                    href="/contacts"
                    className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Contacts
                  </a>
                  <a
                    href="/account/signout"
                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
                  >
                    Sign Out
                  </a>
                </>
              ) : (
                <a
                  href="/account/signin"
                  className="rounded-lg bg-[#357AFF] px-6 py-2 text-white hover:bg-[#2E69DE]"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            メッセージを最適化する
            <span className="text-[#357AFF]">AI</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-500">
            Toneは、あなたのメッセージを受信者との関係性に応じて最適化します。
            本音を保ちながら、より良いコミュニケーションを実現します。
          </p>
          <div className="space-y-4 sm:space-x-4 sm:space-y-0">
            {user ? (
              <a
                href="/messaging"
                className="inline-block rounded-lg bg-[#357AFF] px-8 py-3 text-white hover:bg-[#2E69DE]"
              >
                メッセージを送る
              </a>
            ) : (
              <a
                href="/account/signin"
                className="inline-block rounded-lg bg-[#357AFF] px-8 py-3 text-white hover:bg-[#2E69DE]"
              >
                始める
              </a>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              関係性に応じた最適化
            </h3>
            <p className="text-gray-500">
              家族、友人、同僚など、相手との関係性に合わせて
              メッセージのトーンを自動調整します。
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              本音を保持
            </h3>
            <p className="text-gray-500">
              メッセージの意図や感情は変えずに、
              より適切な表現方法を��案します。
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-4xl">👀</div>
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              原文の確認
            </h3>
            <p className="text-gray-500">
              送信したメッセージを長押しすることで、
              最適化前の原文を確認できます。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainComponent;