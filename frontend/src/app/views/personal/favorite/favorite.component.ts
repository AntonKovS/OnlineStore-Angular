import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  productsFavorite: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((dataFav: FavoriteType[] | DefaultResponseType) => {
        if ((dataFav as DefaultResponseType).error !== undefined) {
          const error = (dataFav as DefaultResponseType).message;
          throw new Error(error);
        }

        this.cartService.getCart()
          .subscribe((dataCart: CartType | DefaultResponseType) => {
            if ((dataCart as DefaultResponseType).error !== undefined) {
              throw new Error((dataCart as DefaultResponseType).message);
            }

            this.productsFavorite = (dataFav as FavoriteType[]).map(product => {
              product.inCartCount = 1;
              // if ((dataCart as CartType) && (dataCart as CartType).items.length > 0) {
              const productInCart = (dataCart as CartType).items
                .find(item => item.product.id === product.id);
              if (productInCart) {
                product.inCart = true;
                product.inCartCount = productInCart.quantity;
              }
              return product;
            });
            // }

          });
      });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //..
          throw new Error(data.message);
        }
        this.productsFavorite = this.productsFavorite.filter(item => item.id !== id)
      })
  }

  addToCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, product.inCartCount)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.inCart = true;
      });
  }

  updateCount(value: number, product: FavoriteType) {
    product.inCartCount = value;
    if (product.inCart) {
      this.cartService.updateCart(product.id, value)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          product.inCart = true;
        });
    }
  }

  removeFromCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.inCart = false;
        product.inCartCount = 1;
      });
  }

}
