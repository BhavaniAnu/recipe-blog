import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

import { Recipe } from '../recipe.model';
import { RecipesService } from '../recipes.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  // recipes = [
  //   { title: "First Recipe", content: "This is the first recipe's  content" },
  //   { title: "Second Recipe", content: "This is the second recipe's  content" },
  //   { title: "Third Recipe", content: "This is the third recipe's  content" },
  // ];
  recipes: Recipe[] = [];
  isLoading = false;
  totalRecipes = 0;
  recipesPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private recipesSub: Subscription;
  private authStatusSub: Subscription;

  constructor(
    public recipesService: RecipesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.recipesService.getRecipes(this.recipesPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.recipesSub = this.recipesService.getRecipeUpdateListener()
      .subscribe((recipeData: {recipes: Recipe[], recipeCount: number}) => {
        this.isLoading = false;
        this.totalRecipes = recipeData.recipeCount;
        this.recipes = recipeData.recipes;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.recipesPerPage = pageData.pageSize;
    this.recipesService.getRecipes(this.recipesPerPage, this.currentPage);
  }

  onDelete(recipeId: string) {
    this.isLoading = true;
    this.recipesService.deleteRecipe(recipeId).subscribe(() => {
      this.recipesService.getRecipes(this.recipesPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.recipesSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
