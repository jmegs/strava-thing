/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
	interface SessionData {
		auth: import("./shared/types").SessionData
	}
}
