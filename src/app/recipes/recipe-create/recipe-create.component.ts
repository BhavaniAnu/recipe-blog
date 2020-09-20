import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { RecipesService } from '../recipes.service';
import { Recipe } from '../recipe.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-recipe-create',
  templateUrl: './recipe-create.component.html',
  styleUrls: ['./recipe-create.component.css']
})
export class RecipeCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  recipe: Recipe;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private recipeId: string;
  private authStatusSub: Subscription;

  constructor(
    public recipesService: RecipesService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('recipeId')) {
        this.mode = 'edit';
        this.recipeId = paramMap.get('recipeId');
        this.isLoading = true;
        this.recipesService.getRecipe(this.recipeId).subscribe(recipeData => {
          this.isLoading = false;
          this.recipe = {
            id: recipeData._id,
            title: recipeData.title,
            content: recipeData.content,
            imagePath: recipeData.imagePath,
            creator: recipeData.creator
          };
          this.form.setValue({
            title: this.recipe.title,
            content: this.recipe.content,
            image: this.recipe.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.recipeId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveRecipe() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.recipesService.addRecipe(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.recipesService.updateRecipe(
        this.recipeId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
