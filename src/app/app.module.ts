// Ядро
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';


// Провайдеры
import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import { Connect } from '../providers/Connect';
import { ProductServices } from '../providers/ProductServices';


// Основной компонент
import { App } from './app.component';


// Общие компоненты
import { ProductRating } from '../components/product-rating/product-rating.component';
import { ProductBlackListStrip } from '../components/product-blacklist-strip/product-blacklist-strip.component';


// Страницы и их компоненты
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { ArticlePage } from '../pages/article/article';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { CategoriesPage } from '../pages/categories/categories';

import { ProductsPage } from '../pages/products/products';
import { ProductTest } from '../pages/product/components/test/product-test.component';
import { ProductProps } from '../pages/product/components/props/product-props.component';
import { ProductReviews } from '../pages/product/components/reviews/product-reviews.component';

import { JournalPage } from '../pages/journal/journal';
import { ProductPage } from '../pages/product/product';
import { ProfilePage } from '../pages/profile/profile';
import { ShoppingListPage } from '../pages/shopping-list/shopping-list';
import { AboutPage } from '../pages/about/about';
import { ScannerPage } from '../pages/scanner/scanner';
import { SearchPage } from '../pages/search/search';


@NgModule({
  declarations: [
    App,

    ProductRating,

    AboutPage,
    AccountPage,
    LoginPage,
    PopoverPage,
    CategoriesPage,
    ArticlePage,

    ProductsPage,
    ProductTest,
    ProductProps,
    ProductReviews,
    ProductBlackListStrip,

    SignupPage,
    ProfilePage,
    ShoppingListPage,
    TabsPage,
    TutorialPage,
    ProductPage,
    JournalPage,
    ScannerPage,
    SearchPage

  ],
  imports: [
    IonicModule.forRoot(App)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    App,

    ProductRating,

    AboutPage,
    AccountPage,
    LoginPage,
    PopoverPage,
    CategoriesPage,
    ArticlePage,

    ProductsPage,
    ProductTest,
    ProductProps,
    ProductReviews,
    ProductBlackListStrip,

    SignupPage,
    ProfilePage,
    ShoppingListPage,
    TabsPage,
    TutorialPage,
    ProductPage,
    JournalPage,
    ScannerPage,
    SearchPage

  ],
  providers: [ConferenceData, UserData, Storage, Connect, ProductServices]
})


export class AppModule {}
