import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface Ingredient_Key {
  id: UUIDString;
  __typename?: 'Ingredient_Key';
}

export interface ListAllProductsData {
  products: ({
    id: UUIDString;
    name: string;
    description: string;
    price: number;
  } & Product_Key)[];
}

export interface ListProductsCheaperThan10dollarsData {
  products: ({
    id: UUIDString;
    name: string;
    price: number;
  } & Product_Key)[];
}

export interface OrderItemCustomization_Key {
  id: UUIDString;
  __typename?: 'OrderItemCustomization_Key';
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface ProductIngredient_Key {
  productId: UUIDString;
  ingredientId: UUIDString;
  __typename?: 'ProductIngredient_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface UpdateProductPriceData {
  product_update?: Product_Key | null;
}

export interface UpdateProductPriceVariables {
  id: UUIDString;
  newPrice: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNewUserData, undefined>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(): MutationPromise<CreateNewUserData, undefined>;
export function createNewUser(dc: DataConnect): MutationPromise<CreateNewUserData, undefined>;

interface ListAllProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllProductsData, undefined>;
  operationName: string;
}
export const listAllProductsRef: ListAllProductsRef;

export function listAllProducts(): QueryPromise<ListAllProductsData, undefined>;
export function listAllProducts(dc: DataConnect): QueryPromise<ListAllProductsData, undefined>;

interface UpdateProductPriceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductPriceVariables): MutationRef<UpdateProductPriceData, UpdateProductPriceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProductPriceVariables): MutationRef<UpdateProductPriceData, UpdateProductPriceVariables>;
  operationName: string;
}
export const updateProductPriceRef: UpdateProductPriceRef;

export function updateProductPrice(vars: UpdateProductPriceVariables): MutationPromise<UpdateProductPriceData, UpdateProductPriceVariables>;
export function updateProductPrice(dc: DataConnect, vars: UpdateProductPriceVariables): MutationPromise<UpdateProductPriceData, UpdateProductPriceVariables>;

interface ListProductsCheaperThan10dollarsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsCheaperThan10dollarsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductsCheaperThan10dollarsData, undefined>;
  operationName: string;
}
export const listProductsCheaperThan10dollarsRef: ListProductsCheaperThan10dollarsRef;

export function listProductsCheaperThan10dollars(): QueryPromise<ListProductsCheaperThan10dollarsData, undefined>;
export function listProductsCheaperThan10dollars(dc: DataConnect): QueryPromise<ListProductsCheaperThan10dollarsData, undefined>;

