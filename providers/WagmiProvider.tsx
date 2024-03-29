"use client";

import '@rainbow-me/rainbowkit/styles.css';

import React, { useState } from "react";
import { bsc } from "wagmi/chains";
import {
	connectorsForWallets,
	RainbowKitAuthenticationProvider,
	RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { publicProvider } from "wagmi/providers/public";
import {WagmiConfig, configureChains, createConfig, useConnect, useAccount} from "wagmi";
import { trustWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { SiweMessage, generateNonce } from "siwe";
import { $api } from '@/lib/axios';
import { useAtom } from 'jotai';
import { authenticatedStatusAtom } from '@/lib/atom';

const { chains, publicClient } = configureChains([bsc], [publicProvider()]);

const projectId = 'dc0f9c2e5311b53b1e1533036868b684'

const connectors = connectorsForWallets([
	{
		groupName: "Artery Most",
		wallets: [
			trustWallet({ projectId, chains, shimDisconnect: true }),
			metaMaskWallet({ projectId, chains, shimDisconnect: true })
		],
	}
]);

const config = createConfig({
	autoConnect: true,
	connectors,
	publicClient
});

export const WagmiProvider = ({ children }: { children: React.ReactNode }) => {
	const [authenticated, setAuthenticated] = useAtom(authenticatedStatusAtom)

	const authenticationAdapter = createAuthenticationAdapter({
		getNonce: async () => {
		  return generateNonce();
		},
	  
		createMessage: ({ nonce, address, chainId }) => {
			return new SiweMessage({
				domain: window.location.host,
				address,
				statement: 'Artery Most - Auth in to the app.',
				uri: window.location.origin,
				version: '1',
				chainId,
				nonce,
			  });
		},
	  
		getMessageBody: ({ message }) => {
		  return message.prepareMessage();
		},
	  
		verify: async ({ message, signature }) => {
		  setAuthenticated('loading');

		  const verifyRes: { accessToken: string } = await $api.post('/auth/verify', {
						message,
						signature,
		  }).then(res => res.data);

		  localStorage.setItem("token", verifyRes.accessToken)
		  
		  setAuthenticated('authenticated');

		  return Boolean(verifyRes.accessToken);
		},
	  
		signOut: async () => {
		  await $api.post('/auth/logout');
		  localStorage.removeItem("token");
		  setAuthenticated('unauthenticated');
		},
	  });

	return (
		<WagmiConfig config={config}>
			<RainbowKitAuthenticationProvider
						adapter={authenticationAdapter}
						status={authenticated ?? 'unauthenticated'}
						>
				<RainbowKitProvider chains={chains} initialChain={bsc}>
					{children}
				</RainbowKitProvider>
			</RainbowKitAuthenticationProvider>
		</WagmiConfig>
	);
};