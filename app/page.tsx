import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            リアルタイム承認システム
          </h1>
          <p className="text-xl text-gray-600">
            Azure Web PubSubを使った承認フローのデモ
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* リクエスト送信カード */}
          <Link href="/request">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  リクエスト送信
                </h2>
                <p className="text-gray-600">
                  承認をリクエストする
                </p>
              </div>
            </div>
          </Link>

          {/* 承認者ダッシュボードカード */}
          <Link href="/admin">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  承認者ダッシュボード
                </h2>
                <p className="text-gray-600">
                  リクエストを承認・拒否する
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            システムの流れ
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>ユーザーが名前とメッセージを入力してリクエスト送信</li>
            <li>承認者にリアルタイムで通知が届く</li>
            <li>承認者が承認または拒否を選択</li>
            <li>結果がリアルタイムで全ユーザーに通知される</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
