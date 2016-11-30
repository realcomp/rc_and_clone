// Ядро
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';


// Сервисы
import { ConnectService } from '../services/connect.service';
import { ProductService } from '../services/product.service';
import { JournalService } from '../services/journal.service';
import { DbService } from '../services/db.service';
import { UserService } from '../services/user.service';
import { TabsService } from '../services/tabs.service';
import { ModalService } from '../services/modal.service';


// Основной компонент
import { App } from './app.component';


// Общие компоненты
import { ProductItem } from '../components/product-item/product-item.component';
import { ProductRating } from '../components/product-rating/product-rating.component';
import { ProductBlackListStrip } from '../components/product-blacklist-strip/product-blacklist-strip.component';
import { ProductRatingRows } from '../components/product-rating-rows/product-rating-rows.component';
import { Search } from '../components/search/search.component';
import { ArticleItem } from '../components/article-item/article-item.component';


// Всплывающие окна
import { BasicModal } from '../components/basic-modal/basic-modal.component';
import { AuthModal } from '../components/auth-modal/auth-modal.component';


// Страницы и их компоненты
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { ArticlePage } from '../pages/article/article';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { CategoriesPage } from '../pages/categories/categories';
import { Category } from '../pages/categories/components/category.component';

import { ProductsPage } from '../pages/products/products';
import { ProductTest } from '../pages/product/components/test/product-test.component';
import { ProductProps } from '../pages/product/components/props/product-props.component';
import { ProductReviews } from '../pages/product/components/reviews/product-reviews.component';

import { JournalPage } from '../pages/journal/journal';
import { ProductPage } from '../pages/product/product';
import { ProfilePage } from '../pages/profile/profile';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { ShoppingListPage } from '../pages/shopping-list/shopping-list';
import { AboutPage } from '../pages/about/about';
import { ScannerPage } from '../pages/scanner/scanner';
import { ScannerNotFoundPage } from '../pages/scanner-not-found/scanner-not-found';

import { SearchPage } from '../pages/search/search';
import { ProductItemSearch } from '../pages/search/components/product-item/product-item-search.component';




@NgModule({
  declarations: [
    App,

    CategoriesPage,
    Category,

    ProductItem,
    ProductRating,
    ProductBlackListStrip,
    ProductRatingRows,
    Search,
    ArticleItem,

    BasicModal,
    AuthModal,

    AboutPage,
    AccountPage,
    LoginPage,
    PopoverPage,
    ArticlePage,

    ProductsPage,
    ProductTest,
    ProductProps,
    ProductReviews,

    SignupPage,
    ProfilePage,
    EditProfilePage,
    ShoppingListPage,
    TabsPage,
    TutorialPage,
    ProductPage,
    JournalPage,
    ScannerPage,
    ScannerNotFoundPage,

    SearchPage,
    ProductItemSearch

  ],
  imports: [
    IonicModule.forRoot(App)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    App,

    CategoriesPage,
    Category,

    BasicModal,
    AuthModal,

    AboutPage,
    AccountPage,
    LoginPage,
    PopoverPage,
    ArticlePage,

    ProductsPage,

    SignupPage,
    ProfilePage,
    EditProfilePage,
    ShoppingListPage,
    TabsPage,
    TutorialPage,
    ProductPage,
    JournalPage,
    ScannerPage,
    ScannerNotFoundPage,

    SearchPage,

  ],
  providers: [ConnectService, ProductService, JournalService, DbService, UserService, TabsService, ModalService]
})


export class AppModule {}
