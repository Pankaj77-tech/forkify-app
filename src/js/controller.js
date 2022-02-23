import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable"; /////////polyfilling else
import "regenerator-runtime/runtime"; /////////polyfilling async await

const recipeContainer = document.querySelector(".recipe");

// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    ///////////updating results view to selected search result

    resultsView.update(model.getSearchResultsPage());

    ///////updating recipe
    bookmarksView.update(model.state.bookmarks);

    ////////////Loading Recipe
    await model.loadRecipe(id); /////////this function doesn't return anything that's why it is not stored in a variable

    // const { recipe } = model.state;

    //////Rendering Recipe
    // const recipeView = new recipeView(model.state.recipe)

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    /////getting search query
    const query = searchView.getQuery();
    if (!query) return;
    ///load search results

    await model.loadSearchResults(query);

    ///////////////render search results
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());
    // resultsView.render(model.state.search.results);

    /////////////////rendering initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));

  /////rendering pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  ///////// updating the recipe servings (in state)
  model.updateServings(newServings);

  // updating the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  ///// add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //////////updating recipe view

  recipeView.update(model.state.recipe);

  //////render bookmarks

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    ///////// Uploading new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    ///////// Rendering the  recipe
    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    ///////// Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    ///////// Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    ///////// Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("💥", err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
