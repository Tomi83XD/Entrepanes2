import { CreateNewUserData, ListAllProductsData, UpdateProductPriceData, UpdateProductPriceVariables, ListProductsCheaperThan10dollarsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewUser(options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewUserData, undefined>;
export function useCreateNewUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewUserData, undefined>;

export function useListAllProducts(options?: useDataConnectQueryOptions<ListAllProductsData>): UseDataConnectQueryResult<ListAllProductsData, undefined>;
export function useListAllProducts(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllProductsData>): UseDataConnectQueryResult<ListAllProductsData, undefined>;

export function useUpdateProductPrice(options?: useDataConnectMutationOptions<UpdateProductPriceData, FirebaseError, UpdateProductPriceVariables>): UseDataConnectMutationResult<UpdateProductPriceData, UpdateProductPriceVariables>;
export function useUpdateProductPrice(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductPriceData, FirebaseError, UpdateProductPriceVariables>): UseDataConnectMutationResult<UpdateProductPriceData, UpdateProductPriceVariables>;

export function useListProductsCheaperThan10dollars(options?: useDataConnectQueryOptions<ListProductsCheaperThan10dollarsData>): UseDataConnectQueryResult<ListProductsCheaperThan10dollarsData, undefined>;
export function useListProductsCheaperThan10dollars(dc: DataConnect, options?: useDataConnectQueryOptions<ListProductsCheaperThan10dollarsData>): UseDataConnectQueryResult<ListProductsCheaperThan10dollarsData, undefined>;
