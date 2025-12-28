import components from './components.json'
import articles from './pages/articles.json'
import comparison from './pages/comparison.json'
import curatedCollections from './pages/curated-collections.json'
import docs from './pages/docs.json'
import home from './pages/home.json'
import manifesto from './pages/manifesto.json'
import stacks from './pages/stacks.json'
import shared from './shared.json'

const messages = {
  shared,
  components,
  pages: {
    home,
    manifesto,
    docs,
    articles,
    curatedCollections,
    ...stacks,
    comparison,
  },
}

export default messages
