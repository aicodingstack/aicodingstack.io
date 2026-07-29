/**
 * Translation exports for de locale
 *
 * This file exports all translation resources for the de locale.
 * It follows the i18n architecture rules defined in docs/I18N-ARCHITECTURE-RULES.md
 */

// Component translations
import componentsCommon from './components/common.json'
import componentsControls from './components/controls.json'
import componentsNavigation from './components/navigation.json'
import componentsProduct from './components/product.json'
import componentsSidebar from './components/sidebar.json'
import articles from './pages/articles.json'
import clis from './pages/clis.json'
import comparison from './pages/comparison.json'
import curatedCollections from './pages/curated-collections.json'
import desktops from './pages/desktops.json'
import docs from './pages/docs.json'
import extensions from './pages/extensions.json'
// Page translations
import home from './pages/home.json'
import ides from './pages/ides.json'
import landscape from './pages/landscape.json'
import manifesto from './pages/manifesto.json'
import modelCompare from './pages/model-compare.json'
import modelDetail from './pages/model-detail.json'
import modelIntelligenceIndex from './pages/model-intelligence-index.json'
import modelPriceIntelligenceIndex from './pages/model-price-intelligence-index.json'
import modelProviders from './pages/model-providers.json'
import models from './pages/models.json'
import openSourceRank from './pages/open-source-rank.json'
import search from './pages/search.json'
import stacksOverview from './pages/stacks-overview.json'
import vendors from './pages/vendors.json'
// Shared translations
import shared from './shared.json'

export default {
  shared,
  pages: {
    home,
    landscape,
    comparison,
    manifesto,
    search,
    openSourceRank,
    docs,
    curatedCollections,
    articles,
    ides,
    clis,
    desktops,
    extensions,
    models,
    modelDetail,
    modelIntelligenceIndex,
    modelPriceIntelligenceIndex,
    modelCompare,
    modelProviders,
    vendors,
    stacksOverview,
  },
  components: {
    common: componentsCommon,
    navigation: componentsNavigation,
    controls: componentsControls,
    sidebar: componentsSidebar,
    product: componentsProduct,
  },
} as const
