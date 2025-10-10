"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

import { ExternalLinkIcon, Heart } from "lucide-react"
import { useQiita } from "../contexts/QiitaContext"

export default function QiitaArticles() {
  const { articles, loading, error } = useQiita()

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen py-20 relative overflow-hidden flex items-center">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Qiita Articles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Technical articles and insights shared on Qiita platform.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 6).map((article) => (
              <motion.div
                key={article.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card 
                  className="hover-card h-full flex flex-col bg-white border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleArticleClick(article.url)}
                >
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-500">
                        {new Date(article.created_at).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{article.likes_count}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                    
                    {/* Tags hidden per request */}
                    {/* <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag.name} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          +{article.tags.length - 3}
                        </Badge>
                      )}
                    </div> */}
                    
                    <div className="flex items-center text-sm text-gray-600 mt-auto">
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      <span>Read on Qiita</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <motion.a
            href="https://qiita.com/Pitta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View all articles on Qiita
            <ExternalLinkIcon className="h-4 w-4 ml-2" />
          </motion.a>
        </div>
      </div>
    </div>
  )
}