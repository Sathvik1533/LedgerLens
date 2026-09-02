import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix thead tr
content = content.replace('<th scope="col" className="py-3 px-5 text-right w-28">Action</th>\n                </motion.tr>', '<th scope="col" className="py-3 px-5 text-right w-28">Action</th>\n                </tr>')

# Fix body tr 
bad_tr = """<motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={item.case_id}
                      onClick={() => handleRowClick(item.case_id)}
                      className="hover:bg-source-blue/10 border-l-2 border-transparent hover:border-l-source-blue transition-colors cursor-pointer group"
                    > handleRowClick(item.case_id)}
                      className="hover:bg-source-blue/10 hover:border-l-2 hover:border-l-blue-400 transition-colors cursor-pointer group"
                    >"""
good_tr = """<motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={item.case_id}
                      onClick={() => handleRowClick(item.case_id)}
                      className="hover:bg-source-blue/10 border-l-2 border-transparent hover:border-l-source-blue transition-colors cursor-pointer group"
                    >"""
content = content.replace(bad_tr, good_tr)

with open(path, 'w') as f:
    f.write(content)
