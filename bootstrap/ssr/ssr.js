import { Fragment, computed, createBlock, createCommentVNode, createSSRApp, createTextVNode, createVNode, h, mergeProps, nextTick, onMounted, onUnmounted, openBlock, reactive, ref, renderList, toDisplayString, unref, useSSRContext, vModelText, vShow, watch, withCtx, withDirectives, withKeys, withModifiers } from "vue";
import { renderToString, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/vue3";
import axios$1 from "axios";
import Echo from "laravel-echo";
import createServer from "@inertiajs/vue3/server";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region resources/js/Layouts/AppLayout.vue
var _sfc_main$21 = {
	__name: "AppLayout",
	__ssrInlineRender: true,
	setup(__props) {
		const page = usePage();
		const authUser = computed(() => page.props.auth?.user || page.props.authUser || null);
		const menuTrigger = ref(null);
		const menuOpen = ref(false);
		const closeMenu = () => menuOpen.value = false;
		const handleClickOutside = (event) => {
			if (menuTrigger.value && !menuTrigger.value.contains(event.target)) closeMenu();
		};
		onMounted(() => {
			menuOpen.value = false;
			document.addEventListener("click", handleClickOutside);
		});
		onUnmounted(() => {
			document.removeEventListener("click", handleClickOutside);
		});
		const mainClass = computed(() => {
			if (page.component === "Home" || page.component === "Profile/Show" || page.component === "Profile/Edit" || page.component === "Chat/Chats" || page.component === "Posts/Show" || page.component === "Admin/Index" || page.component === "Admin/Comments" || page.component === "Admin/Posts" || page.component === "Admin/Users" || page.component === "Profile/LikedPosts" || page.component === "Auth/Auth.vue" || page.component === "Settings/Index" || page.component === "Settings/Notifications") return "main-home";
			return "main-padded";
		});
		const footerClass = computed(() => {
			if (page.component === "Chat/Chats") return "footer-hidden";
			return "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}><header>`);
			_push(ssrRenderComponent(unref(Link), {
				class: "logo",
				href: "/"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="l1"${_scopeId}>vis</p><p class="l2"${_scopeId}>ket</p>`);
					else return [createVNode("p", { class: "l1" }, "vis"), createVNode("p", { class: "l2" }, "ket")];
				}),
				_: 1
			}, _parent));
			if (authUser.value) {
				_push(`<div class="menu-trigger">`);
				if (authUser.value.avatar && authUser.value.avatar.startsWith("http")) _push(`<img${ssrRenderAttr("src", authUser.value.avatar)} alt="avatar" class="header-avatar">`);
				else if (authUser.value.avatar) _push(`<img${ssrRenderAttr("src", "/storage/" + authUser.value.avatar)} alt="avatar" class="header-avatar">`);
				else _push(`<img src="/images/User-avatar.png" alt="avatar" class="header-avatar">`);
				_push(`<img class="burger-menu" src="/images/burger.svg" alt="burger-menu"><div class="${ssrRenderClass([{ "dropdown-open": menuOpen.value }, "dropdown-menu"])}">`);
				if (authUser.value.is_admin) _push(ssrRenderComponent(unref(Link), {
					href: "/admin",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/database.svg" alt="" class="menu-icon"${_scopeId}> Админ панель `);
						else return [createVNode("img", {
							src: "/images/database.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Админ панель ")];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(ssrRenderComponent(unref(Link), {
					href: "/chats",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<img src="/images/speech-bubble.svg" alt="" class="menu-icon"${_scopeId}> Чаты `);
							if (authUser.value.unreadChatsCount) _push(`<span class="counter-badge"${_scopeId}>${ssrInterpolate(authUser.value.unreadChatsCount)}</span>`);
							else _push(`<!---->`);
						} else return [
							createVNode("img", {
								src: "/images/speech-bubble.svg",
								alt: "",
								class: "menu-icon"
							}),
							createTextVNode(" Чаты "),
							authUser.value.unreadChatsCount ? (openBlock(), createBlock("span", {
								key: 0,
								class: "counter-badge"
							}, toDisplayString(authUser.value.unreadChatsCount), 1)) : createCommentVNode("", true)
						];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/profile/" + authUser.value.id,
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/person.svg" alt="" class="menu-icon"${_scopeId}> Профиль `);
						else return [createVNode("img", {
							src: "/images/person.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Профиль ")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/balance",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/wallet.svg" alt="" class="menu-icon"${_scopeId}> Баланс: ${ssrInterpolate(authUser.value.balance)} ₽ `);
						else return [createVNode("img", {
							src: "/images/wallet.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Баланс: " + toDisplayString(authUser.value.balance) + " ₽ ", 1)];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/notifications",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<img src="/images/bell.svg" alt="" class="menu-icon"${_scopeId}> Уведомления `);
							if (authUser.value.unreadNotificationsCount) _push(`<span class="counter-badge"${_scopeId}>${ssrInterpolate(authUser.value.unreadNotificationsCount)}</span>`);
							else _push(`<!---->`);
						} else return [
							createVNode("img", {
								src: "/images/bell.svg",
								alt: "",
								class: "menu-icon"
							}),
							createTextVNode(" Уведомления "),
							authUser.value.unreadNotificationsCount ? (openBlock(), createBlock("span", {
								key: 0,
								class: "counter-badge"
							}, toDisplayString(authUser.value.unreadNotificationsCount), 1)) : createCommentVNode("", true)
						];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/settings",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/settings.svg" alt="" class="menu-icon"${_scopeId}> Настройки `);
						else return [createVNode("img", {
							src: "/images/settings.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Настройки ")];
					}),
					_: 1
				}, _parent));
				_push(`<button type="button"><img src="/images/exit.svg" alt="" class="menu-icon"> Выйти </button></div></div>`);
			} else _push(ssrRenderComponent(unref(Link), {
				href: "/login",
				class: "login-link"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Войти`);
					else return [createTextVNode("Войти")];
				}),
				_: 1
			}, _parent));
			_push(`</header><div class="${ssrRenderClass([{ "overlay-active": menuOpen.value }, "overlay overlay-active-mobile"])}"></div><div class="${ssrRenderClass([{ "mobile-menu-open": menuOpen.value }, "mobile-menu"])}"><button class="mobile-menu-close">✕</button>`);
			if (authUser.value) {
				_push(`<!--[-->`);
				if (authUser.value.is_admin) _push(ssrRenderComponent(unref(Link), {
					href: "/admin",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Админ панель`);
						else return [createTextVNode("Админ панель")];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(ssrRenderComponent(unref(Link), {
					href: "/chats",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Чаты`);
						else return [createTextVNode("Чаты")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/profile/" + authUser.value.id,
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Профиль`);
						else return [createTextVNode("Профиль")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/balance",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Баланс: ${ssrInterpolate(authUser.value.balance)} ₽`);
						else return [createTextVNode("Баланс: " + toDisplayString(authUser.value.balance) + " ₽", 1)];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/notifications",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Уведомления`);
						else return [createTextVNode("Уведомления")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/settings",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Настройки`);
						else return [createTextVNode("Настройки")];
					}),
					_: 1
				}, _parent));
				_push(`<div class="mobile-menu-footer"><button type="button">Выйти</button></div><!--]-->`);
			} else _push(ssrRenderComponent(unref(Link), {
				href: "/login",
				onClick: closeMenu
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Войти`);
					else return [createTextVNode("Войти")];
				}),
				_: 1
			}, _parent));
			_push(`</div><main class="${ssrRenderClass(mainClass.value)}">`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main><footer class="${ssrRenderClass(footerClass.value)}"><div><a>Адрес компании</a><a>Телефонный номер</a><a>Электронная почта</a></div><div><a>О нас</a><a>Услуги или продукты</a><a>Часто задаваемые вопросы (FAQ)</a></div><div><a>Политика конфиденциальности</a><a>Условия использования</a><a>© 2025 Все права защищены.</a></div></footer></div>`);
		};
	}
};
var _sfc_setup$21 = _sfc_main$21.setup;
_sfc_main$21.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/AppLayout.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region resources/js/Pages/Admin/Comments.vue
var Comments_exports = /* @__PURE__ */ __exportAll({ default: () => Comments_default });
var DEFAULT_AVATAR$1 = "/images/User-avatar.png";
var _sfc_main$20 = {
	__name: "Comments",
	__ssrInlineRender: true,
	props: { mode: {
		type: String,
		default: "comments"
	} },
	setup(__props) {
		const props = __props;
		let adminLink = null;
		let adminScript = null;
		const comments = ref([]);
		const searchQuery = ref("");
		const loading = ref(true);
		const error = ref(null);
		const deleting = ref(null);
		const openReports = ref({});
		const mode = computed(() => props.mode || "comments");
		const filteredComments = computed(() => {
			if (!searchQuery.value) return comments.value;
			const query = searchQuery.value.toLowerCase();
			return comments.value.filter((comment) => comment.text.toLowerCase().includes(query) || comment.user?.name.toLowerCase().includes(query) || comment.post?.title.toLowerCase().includes(query));
		});
		const fetchComments = async () => {
			try {
				loading.value = true;
				error.value = null;
				let params = "";
				if (mode.value === "reports") params = "?mode=reports";
				const response = await axios$1.get(`/admin/comments/data${params}`);
				comments.value = response.data.comments || response.data;
			} catch (err) {
				console.error("Ошибка загрузки комментариев:", err);
				error.value = "Не удалось загрузить комментарии";
			} finally {
				loading.value = false;
			}
		};
		const getUserAvatar = (user) => {
			if (user?.avatar) return `/storage/${user.avatar}`;
			return DEFAULT_AVATAR$1;
		};
		const handleImageError = (event) => {
			event.target.src = DEFAULT_AVATAR$1;
		};
		const formatDate = (dateString) => {
			if (!dateString) return "";
			const date = new Date(dateString);
			const diffInSeconds = Math.floor((/* @__PURE__ */ new Date() - date) / 1e3);
			if (diffInSeconds < 60) return "только что";
			const diffInMinutes = Math.floor(diffInSeconds / 60);
			if (diffInMinutes < 60) return `${diffInMinutes} ${pluralize(diffInMinutes, "минуту", "минуты", "минут")} назад`;
			const diffInHours = Math.floor(diffInMinutes / 60);
			if (diffInHours < 24) return `${diffInHours} ${pluralize(diffInHours, "час", "часа", "часов")} назад`;
			const diffInDays = Math.floor(diffInHours / 24);
			if (diffInDays < 7) return `${diffInDays} ${pluralize(diffInDays, "день", "дня", "дней")} назад`;
			const diffInWeeks = Math.floor(diffInDays / 7);
			if (diffInWeeks < 4) return `${diffInWeeks} ${pluralize(diffInWeeks, "неделю", "недели", "недель")} назад`;
			const diffInMonths = Math.floor(diffInDays / 30);
			if (diffInMonths < 12) return `${diffInMonths} ${pluralize(diffInMonths, "месяц", "месяца", "месяцев")} назад`;
			const diffInYears = Math.floor(diffInDays / 365);
			return `${diffInYears} ${pluralize(diffInYears, "год", "года", "лет")} назад`;
		};
		const pluralize = (number, one, few, many) => {
			const mod10 = number % 10;
			const mod100 = number % 100;
			if (mod10 === 1 && mod100 !== 11) return one;
			if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
			return many;
		};
		const deleteComment = async (commentId) => {
			if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) return;
			try {
				deleting.value = commentId;
				await axios$1.delete(`/admin/comments/${commentId}`);
				comments.value = comments.value.filter((comment) => comment.id !== commentId);
				alert("Комментарий успешно удален");
			} catch (err) {
				console.error("Ошибка удаления комментария:", err);
				alert("Не удалось удалить комментарий");
			} finally {
				deleting.value = null;
			}
		};
		const toggleReports = (commentId) => {
			openReports.value[commentId] = !openReports.value[commentId];
		};
		const dismissCommentReports = async (commentId) => {
			try {
				deleting.value = commentId;
				await axios$1.post(`/admin/comments/${commentId}/dismiss-reports`);
				comments.value = comments.value.filter((comment) => comment.id !== commentId);
			} catch (err) {
				console.error("Ошибка игнорирования жалоб:", err);
				alert("Не удалось игнорировать жалобы");
			} finally {
				deleting.value = null;
			}
		};
		const formatReportDate = (dateString) => {
			if (!dateString) return "";
			return new Date(dateString).toLocaleDateString("ru-RU", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const handleSearch = () => {};
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
			adminScript = document.createElement("script");
			adminScript.src = "/js/admin.js";
			document.body.appendChild(adminScript);
			fetchComments();
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
			if (adminScript) {
				document.body.removeChild(adminScript);
				adminScript = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-aa9f3e92${_scopeId}><h1 data-v-aa9f3e92${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Жалобы на комментарии" : "Управление комментариями")}</h1><div class="admin-nav" data-v-aa9f3e92${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/users",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/posts",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: mode.value === "reports" ? "/admin/comments?mode=reports" : "/admin/comments",
							class: ["admin-nav-item", { active: mode.value !== "reports" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="search-container" data-v-aa9f3e92${_scopeId}><input type="text" id="commentSearch"${ssrRenderAttr("value", searchQuery.value)} placeholder="Поиск комментария..." data-v-aa9f3e92${_scopeId}></div>`);
						if (loading.value) _push(`<div class="loading" data-v-aa9f3e92${_scopeId}> Загрузка... </div>`);
						else if (error.value) _push(`<div class="error" data-v-aa9f3e92${_scopeId}>${ssrInterpolate(error.value)}</div>`);
						else {
							_push(`<div class="comments-list" data-v-aa9f3e92${_scopeId}><!--[-->`);
							ssrRenderList(filteredComments.value, (comment) => {
								_push(`<div class="comment-item" data-v-aa9f3e92${_scopeId}><div class="comment-info" data-v-aa9f3e92${_scopeId}><div class="comment-header" data-v-aa9f3e92${_scopeId}><img${ssrRenderAttr("src", getUserAvatar(comment.user))}${ssrRenderAttr("alt", comment.user?.name)} class="comment-avatar" data-v-aa9f3e92${_scopeId}><div data-v-aa9f3e92${_scopeId}><h3 data-v-aa9f3e92${_scopeId}>${ssrInterpolate(comment.user?.name || "Неизвестный пользователь")}</h3><small data-v-aa9f3e92${_scopeId}>${ssrInterpolate(formatDate(comment.created_at))}</small></div></div><p data-v-aa9f3e92${_scopeId}>${ssrInterpolate(comment.text)}</p><small data-v-aa9f3e92${_scopeId}>К посту: ${ssrInterpolate(comment.post?.title || "Пост удален")}</small>`);
								if (mode.value === "reports" && comment.reports?.length) {
									_push(`<div class="reports-info" data-v-aa9f3e92${_scopeId}><p class="reports-count" data-v-aa9f3e92${_scopeId}>Жалоб: ${ssrInterpolate(comment.reports.length)}</p><button class="attempts-toggle" data-v-aa9f3e92${_scopeId}> Подробнее <span class="${ssrRenderClass([{ open: openReports.value[comment.id] }, "arrow"])}" data-v-aa9f3e92${_scopeId}>▼</span></button>`);
									if (openReports.value[comment.id]) {
										_push(`<div class="rejections-dropdown" data-v-aa9f3e92${_scopeId}><!--[-->`);
										ssrRenderList(comment.reports, (report) => {
											_push(`<div class="rejection-item" data-v-aa9f3e92${_scopeId}><div class="rejection-date" data-v-aa9f3e92${_scopeId}>${ssrInterpolate(formatReportDate(report.created_at))}</div><div class="rejection-reason" data-v-aa9f3e92${_scopeId}>${ssrInterpolate(report.reason)}</div><div class="reporter-info" data-v-aa9f3e92${_scopeId}>От: ${ssrInterpolate(report.reporter?.name || "Неизвестный")}</div></div>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="comment-actions" data-v-aa9f3e92${_scopeId}>`);
								if (comment.post) _push(ssrRenderComponent(unref(Link), {
									href: `/posts/${comment.post.id}`,
									class: "btn"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` К посту `);
										else return [createTextVNode(" К посту ")];
									}),
									_: 2
								}, _parent, _scopeId));
								else _push(`<!---->`);
								if (mode.value === "reports") _push(`<!--[--><button class="btn btn-dismiss"${ssrIncludeBooleanAttr(deleting.value === comment.id) ? " disabled" : ""} data-v-aa9f3e92${_scopeId}>${ssrInterpolate(deleting.value === comment.id ? "..." : "Игнорировать")}</button><button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === comment.id) ? " disabled" : ""} data-v-aa9f3e92${_scopeId}> Удалить </button><!--]-->`);
								else _push(`<button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === comment.id) ? " disabled" : ""} data-v-aa9f3e92${_scopeId}>${ssrInterpolate(deleting.value === comment.id ? "Удаление..." : "Удалить")}</button>`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
							if (filteredComments.value.length === 0) _push(`<div class="no-results" data-v-aa9f3e92${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Нет жалоб на комментарии" : "Комментарии не найдены")}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, toDisplayString(mode.value === "reports" ? "Жалобы на комментарии" : "Управление комментариями"), 1),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/users",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/posts",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: mode.value === "reports" ? "/admin/comments?mode=reports" : "/admin/comments",
								class: ["admin-nav-item", { active: mode.value !== "reports" }]
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							}, 8, ["href", "class"])
						]),
						createVNode("div", { class: "search-container" }, [withDirectives(createVNode("input", {
							type: "text",
							id: "commentSearch",
							"onUpdate:modelValue": ($event) => searchQuery.value = $event,
							placeholder: "Поиск комментария...",
							onInput: handleSearch
						}, null, 40, ["onUpdate:modelValue"]), [[vModelText, searchQuery.value]])]),
						loading.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "loading"
						}, " Загрузка... ")) : error.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "error"
						}, toDisplayString(error.value), 1)) : (openBlock(), createBlock("div", {
							key: 2,
							class: "comments-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredComments.value, (comment) => {
							return openBlock(), createBlock("div", {
								key: comment.id,
								class: "comment-item"
							}, [createVNode("div", { class: "comment-info" }, [
								createVNode("div", { class: "comment-header" }, [createVNode("img", {
									src: getUserAvatar(comment.user),
									alt: comment.user?.name,
									class: "comment-avatar",
									onError: handleImageError
								}, null, 40, ["src", "alt"]), createVNode("div", null, [createVNode("h3", null, toDisplayString(comment.user?.name || "Неизвестный пользователь"), 1), createVNode("small", null, toDisplayString(formatDate(comment.created_at)), 1)])]),
								createVNode("p", null, toDisplayString(comment.text), 1),
								createVNode("small", null, "К посту: " + toDisplayString(comment.post?.title || "Пост удален"), 1),
								mode.value === "reports" && comment.reports?.length ? (openBlock(), createBlock("div", {
									key: 0,
									class: "reports-info"
								}, [
									createVNode("p", { class: "reports-count" }, "Жалоб: " + toDisplayString(comment.reports.length), 1),
									createVNode("button", {
										class: "attempts-toggle",
										onClick: ($event) => toggleReports(comment.id)
									}, [createTextVNode(" Подробнее "), createVNode("span", { class: ["arrow", { open: openReports.value[comment.id] }] }, "▼", 2)], 8, ["onClick"]),
									openReports.value[comment.id] ? (openBlock(), createBlock("div", {
										key: 0,
										class: "rejections-dropdown"
									}, [(openBlock(true), createBlock(Fragment, null, renderList(comment.reports, (report) => {
										return openBlock(), createBlock("div", {
											key: report.id,
											class: "rejection-item"
										}, [
											createVNode("div", { class: "rejection-date" }, toDisplayString(formatReportDate(report.created_at)), 1),
											createVNode("div", { class: "rejection-reason" }, toDisplayString(report.reason), 1),
											createVNode("div", { class: "reporter-info" }, "От: " + toDisplayString(report.reporter?.name || "Неизвестный"), 1)
										]);
									}), 128))])) : createCommentVNode("", true)
								])) : createCommentVNode("", true)
							]), createVNode("div", { class: "comment-actions" }, [comment.post ? (openBlock(), createBlock(unref(Link), {
								key: 0,
								href: `/posts/${comment.post.id}`,
								class: "btn"
							}, {
								default: withCtx(() => [createTextVNode(" К посту ")]),
								_: 1
							}, 8, ["href"])) : createCommentVNode("", true), mode.value === "reports" ? (openBlock(), createBlock(Fragment, { key: 1 }, [createVNode("button", {
								onClick: ($event) => dismissCommentReports(comment.id),
								class: "btn btn-dismiss",
								disabled: deleting.value === comment.id
							}, toDisplayString(deleting.value === comment.id ? "..." : "Игнорировать"), 9, ["onClick", "disabled"]), createVNode("button", {
								onClick: ($event) => deleteComment(comment.id),
								class: "btn btn-danger",
								disabled: deleting.value === comment.id
							}, " Удалить ", 8, ["onClick", "disabled"])], 64)) : (openBlock(), createBlock("button", {
								key: 2,
								onClick: ($event) => deleteComment(comment.id),
								class: "btn btn-danger",
								disabled: deleting.value === comment.id
							}, toDisplayString(deleting.value === comment.id ? "Удаление..." : "Удалить"), 9, ["onClick", "disabled"]))])]);
						}), 128)), filteredComments.value.length === 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "no-results"
						}, toDisplayString(mode.value === "reports" ? "Нет жалоб на комментарии" : "Комментарии не найдены"), 1)) : createCommentVNode("", true)]))
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$20 = _sfc_main$20.setup;
_sfc_main$20.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Comments.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var Comments_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$20, [["__scopeId", "data-v-aa9f3e92"]]);
//#endregion
//#region resources/js/Pages/Admin/Index.vue
var Index_exports$2 = /* @__PURE__ */ __exportAll({ default: () => Index_default$2 });
var _sfc_main$19 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		pendingVerificationCount: {
			type: Number,
			default: 0
		},
		usersReportCount: {
			type: Number,
			default: 0
		},
		postsReportCount: {
			type: Number,
			default: 0
		},
		commentsReportCount: {
			type: Number,
			default: 0
		}
	},
	setup(__props) {
		const pendingCount = ref(__props.pendingVerificationCount || 0);
		let adminLink = null;
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-f7a459b7${_scopeId}><h1 data-v-f7a459b7${_scopeId}>Админ панель</h1><div class="admin-nav" data-v-f7a459b7${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item active"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/users",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/posts",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/comments",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="banner" data-v-f7a459b7${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/verification-requests",
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Заявки на подтверждение аккаунта <span class="badge" data-v-f7a459b7${_scopeId}>${ssrInterpolate(pendingCount.value)}</span>`);
								else return [createTextVNode(" Заявки на подтверждение аккаунта "), createVNode("span", { class: "badge" }, toDisplayString(pendingCount.value), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><h2 data-v-f7a459b7${_scopeId}>Репорты</h2><div class="banners" data-v-f7a459b7${_scopeId}><div class="banner" data-v-f7a459b7${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/users?mode=reports`,
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи <span class="badge" data-v-f7a459b7${_scopeId}>${ssrInterpolate(__props.usersReportCount)}</span>`);
								else return [createTextVNode(" Пользователи "), createVNode("span", { class: "badge" }, toDisplayString(__props.usersReportCount), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="banner" data-v-f7a459b7${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/posts?mode=reports`,
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты <span class="badge" data-v-f7a459b7${_scopeId}>${ssrInterpolate(__props.postsReportCount)}</span>`);
								else return [createTextVNode(" Посты "), createVNode("span", { class: "badge" }, toDisplayString(__props.postsReportCount), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="banner" data-v-f7a459b7${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/comments?mode=reports`,
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии <span class="badge" data-v-f7a459b7${_scopeId}>${ssrInterpolate(__props.commentsReportCount)}</span>`);
								else return [createTextVNode(" Комментарии "), createVNode("span", { class: "badge" }, toDisplayString(__props.commentsReportCount), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div></div></div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, "Админ панель"),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item active"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/users",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/posts",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/comments",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							})
						]),
						createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
							href: "/admin/verification-requests",
							class: "link"
						}, {
							default: withCtx(() => [createTextVNode(" Заявки на подтверждение аккаунта "), createVNode("span", { class: "badge" }, toDisplayString(pendingCount.value), 1)]),
							_: 1
						})]),
						createVNode("h2", null, "Репорты"),
						createVNode("div", { class: "banners" }, [
							createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
								href: `/admin/users?mode=reports`,
								class: "link"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи "), createVNode("span", { class: "badge" }, toDisplayString(__props.usersReportCount), 1)]),
								_: 1
							})]),
							createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
								href: `/admin/posts?mode=reports`,
								class: "link"
							}, {
								default: withCtx(() => [createTextVNode(" Посты "), createVNode("span", { class: "badge" }, toDisplayString(__props.postsReportCount), 1)]),
								_: 1
							})]),
							createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
								href: `/admin/comments?mode=reports`,
								class: "link"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии "), createVNode("span", { class: "badge" }, toDisplayString(__props.commentsReportCount), 1)]),
								_: 1
							})])
						])
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$19 = _sfc_main$19.setup;
_sfc_main$19.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Index.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var Index_default$2 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$19, [["__scopeId", "data-v-f7a459b7"]]);
//#endregion
//#region resources/js/Pages/Admin/Posts.vue
var Posts_exports = /* @__PURE__ */ __exportAll({ default: () => Posts_default });
var _sfc_main$18 = {
	__name: "Posts",
	__ssrInlineRender: true,
	props: { mode: {
		type: String,
		default: "posts"
	} },
	setup(__props) {
		const props = __props;
		let adminLink = null;
		const mode = computed(() => props.mode || "posts");
		const posts = ref([]);
		const searchQuery = ref("");
		const loading = ref(true);
		const error = ref(null);
		const deleting = ref(null);
		const openReports = ref({});
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
		});
		const filteredPosts = computed(() => {
			if (!searchQuery.value) return posts.value;
			const query = searchQuery.value.toLowerCase();
			return posts.value.filter((post) => post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query) || post.user?.name.toLowerCase().includes(query));
		});
		const fetchPosts = async () => {
			try {
				loading.value = true;
				error.value = null;
				let params = "";
				if (mode.value === "reports") params = "?mode=reports";
				const response = await axios$1.get(`/admin/posts/data${params}`);
				posts.value = response.data.posts || response.data;
			} catch (err) {
				console.error("Ошибка загрузки постов:", err);
				error.value = "Не удалось загрузить посты";
			} finally {
				loading.value = false;
			}
		};
		const formatDate = (dateString) => {
			if (!dateString) return "";
			return new Date(dateString).toLocaleDateString("ru-RU", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const toggleReports = (postId) => {
			openReports.value[postId] = !openReports.value[postId];
		};
		const dismissPostReports = async (postId) => {
			try {
				deleting.value = postId;
				await axios$1.post(`/admin/posts/${postId}/dismiss-reports`);
				posts.value = posts.value.filter((post) => post.id !== postId);
			} catch (err) {
				console.error("Ошибка игнорирования жалоб:", err);
				alert("Не удалось игнорировать жалобы");
			} finally {
				deleting.value = null;
			}
		};
		const warnPost = async (postId) => {
			try {
				deleting.value = postId;
				await axios$1.post(`/admin/posts/${postId}/warn`);
				posts.value = posts.value.filter((post) => post.id !== postId);
				alert("Предупреждение отправлено");
			} catch (err) {
				console.error("Ошибка отправки предупреждения:", err);
				alert("Не удалось отправить предупреждение");
			} finally {
				deleting.value = null;
			}
		};
		const hidePost = async (postId) => {
			if (!confirm("Вы уверены, что хотите скрыть этот пост?")) return;
			try {
				deleting.value = postId;
				await axios$1.post(`/admin/posts/${postId}/hide`);
				posts.value = posts.value.filter((post) => post.id !== postId);
				alert("Пост скрыт");
			} catch (err) {
				console.error("Ошибка скрытия поста:", err);
				alert("Не удалось скрыть пост");
			} finally {
				deleting.value = null;
			}
		};
		const deletePost = async (postId) => {
			if (!confirm("Вы уверены, что хотите удалить этот пост?")) return;
			try {
				deleting.value = postId;
				await axios$1.delete(`/admin/posts/${postId}`);
				posts.value = posts.value.filter((post) => post.id !== postId);
				alert("Пост успешно удален");
			} catch (err) {
				console.error("Ошибка удаления поста:", err);
				alert("Не удалось удалить пост");
			} finally {
				deleting.value = null;
			}
		};
		const handleSearch = () => {};
		onMounted(() => {
			const script = document.createElement("script");
			script.src = "/js/admin.js";
			document.body.appendChild(script);
			fetchPosts();
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-ba772c4e${_scopeId}><h1 data-v-ba772c4e${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Жалобы на посты" : "Управление постами")}</h1><div class="admin-nav" data-v-ba772c4e${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/users",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: mode.value === "reports" ? "/admin/posts?mode=reports" : "/admin/posts",
							class: "admin-nav-item active"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/comments",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="search-container" data-v-ba772c4e${_scopeId}><input type="text" id="postSearch"${ssrRenderAttr("value", searchQuery.value)} placeholder="Поиск поста..." data-v-ba772c4e${_scopeId}></div>`);
						if (loading.value) _push(`<div class="loading" data-v-ba772c4e${_scopeId}> Загрузка... </div>`);
						else if (error.value) _push(`<div class="error" data-v-ba772c4e${_scopeId}>${ssrInterpolate(error.value)}</div>`);
						else {
							_push(`<div class="posts-list" data-v-ba772c4e${_scopeId}><!--[-->`);
							ssrRenderList(filteredPosts.value, (post) => {
								_push(`<div class="post-item" data-v-ba772c4e${_scopeId}><img${ssrRenderAttr("src", `/storage/${post.image}`)}${ssrRenderAttr("alt", post.title)} class="post-image" data-v-ba772c4e${_scopeId}><div class="post-info" data-v-ba772c4e${_scopeId}><h3 data-v-ba772c4e${_scopeId}>${ssrInterpolate(post.title)}</h3><p data-v-ba772c4e${_scopeId}>${ssrInterpolate(post.description)}</p><small data-v-ba772c4e${_scopeId}>Автор: ${ssrInterpolate(post.user?.name)}</small>`);
								if (mode.value === "reports" && post.reports?.length) {
									_push(`<div class="reports-info" data-v-ba772c4e${_scopeId}><p class="reports-count" data-v-ba772c4e${_scopeId}>Жалоб: ${ssrInterpolate(post.reports.length)}</p><button class="attempts-toggle" data-v-ba772c4e${_scopeId}> Подробнее <span class="${ssrRenderClass([{ open: openReports.value[post.id] }, "arrow"])}" data-v-ba772c4e${_scopeId}>▼</span></button>`);
									if (openReports.value[post.id]) {
										_push(`<div class="rejections-dropdown" data-v-ba772c4e${_scopeId}><!--[-->`);
										ssrRenderList(post.reports, (report) => {
											_push(`<div class="rejection-item" data-v-ba772c4e${_scopeId}><div class="rejection-date" data-v-ba772c4e${_scopeId}>${ssrInterpolate(formatDate(report.created_at))}</div><div class="rejection-reason" data-v-ba772c4e${_scopeId}>${ssrInterpolate(report.reason)}</div>`);
											if (report.reporter) _push(ssrRenderComponent(unref(Link), {
												href: `/profile/${report.reporter.id}`,
												class: "reporter-info"
											}, {
												default: withCtx((_, _push, _parent, _scopeId) => {
													if (_push) _push(` От: ${ssrInterpolate(report.reporter.name)}`);
													else return [createTextVNode(" От: " + toDisplayString(report.reporter.name), 1)];
												}),
												_: 2
											}, _parent, _scopeId));
											else _push(`<div class="reporter-info" data-v-ba772c4e${_scopeId}>От: Неизвестный</div>`);
											_push(`</div>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="post-actions" data-v-ba772c4e${_scopeId}>`);
								_push(ssrRenderComponent(unref(Link), {
									href: `/posts/${post.id}`,
									class: "btn"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Просмотр `);
										else return [createTextVNode(" Просмотр ")];
									}),
									_: 2
								}, _parent, _scopeId));
								if (mode.value === "reports") _push(`<!--[--><button class="btn btn-dismiss"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-ba772c4e${_scopeId}>${ssrInterpolate(deleting.value === post.id ? "..." : "Игнорировать")}</button><button class="btn btn-warn"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-ba772c4e${_scopeId}> Предупреждение </button><button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-ba772c4e${_scopeId}> Скрыть </button><!--]-->`);
								else _push(`<button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-ba772c4e${_scopeId}>${ssrInterpolate(deleting.value === post.id ? "Удаление..." : "Удалить")}</button>`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
							if (filteredPosts.value.length === 0) _push(`<div class="no-results" data-v-ba772c4e${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Нет жалоб на посты" : "Посты не найдены")}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, toDisplayString(mode.value === "reports" ? "Жалобы на посты" : "Управление постами"), 1),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/users",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: mode.value === "reports" ? "/admin/posts?mode=reports" : "/admin/posts",
								class: "admin-nav-item active"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}, 8, ["href"]),
							createVNode(unref(Link), {
								href: "/admin/comments",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							})
						]),
						createVNode("div", { class: "search-container" }, [withDirectives(createVNode("input", {
							type: "text",
							id: "postSearch",
							"onUpdate:modelValue": ($event) => searchQuery.value = $event,
							placeholder: "Поиск поста...",
							onInput: handleSearch
						}, null, 40, ["onUpdate:modelValue"]), [[vModelText, searchQuery.value]])]),
						loading.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "loading"
						}, " Загрузка... ")) : error.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "error"
						}, toDisplayString(error.value), 1)) : (openBlock(), createBlock("div", {
							key: 2,
							class: "posts-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredPosts.value, (post) => {
							return openBlock(), createBlock("div", {
								key: post.id,
								class: "post-item"
							}, [
								createVNode("img", {
									src: `/storage/${post.image}`,
									alt: post.title,
									class: "post-image"
								}, null, 8, ["src", "alt"]),
								createVNode("div", { class: "post-info" }, [
									createVNode("h3", null, toDisplayString(post.title), 1),
									createVNode("p", null, toDisplayString(post.description), 1),
									createVNode("small", null, "Автор: " + toDisplayString(post.user?.name), 1),
									mode.value === "reports" && post.reports?.length ? (openBlock(), createBlock("div", {
										key: 0,
										class: "reports-info"
									}, [
										createVNode("p", { class: "reports-count" }, "Жалоб: " + toDisplayString(post.reports.length), 1),
										createVNode("button", {
											class: "attempts-toggle",
											onClick: ($event) => toggleReports(post.id)
										}, [createTextVNode(" Подробнее "), createVNode("span", { class: ["arrow", { open: openReports.value[post.id] }] }, "▼", 2)], 8, ["onClick"]),
										openReports.value[post.id] ? (openBlock(), createBlock("div", {
											key: 0,
											class: "rejections-dropdown"
										}, [(openBlock(true), createBlock(Fragment, null, renderList(post.reports, (report) => {
											return openBlock(), createBlock("div", {
												key: report.id,
												class: "rejection-item"
											}, [
												createVNode("div", { class: "rejection-date" }, toDisplayString(formatDate(report.created_at)), 1),
												createVNode("div", { class: "rejection-reason" }, toDisplayString(report.reason), 1),
												report.reporter ? (openBlock(), createBlock(unref(Link), {
													key: 0,
													href: `/profile/${report.reporter.id}`,
													class: "reporter-info"
												}, {
													default: withCtx(() => [createTextVNode(" От: " + toDisplayString(report.reporter.name), 1)]),
													_: 2
												}, 1032, ["href"])) : (openBlock(), createBlock("div", {
													key: 1,
													class: "reporter-info"
												}, "От: Неизвестный"))
											]);
										}), 128))])) : createCommentVNode("", true)
									])) : createCommentVNode("", true)
								]),
								createVNode("div", { class: "post-actions" }, [createVNode(unref(Link), {
									href: `/posts/${post.id}`,
									class: "btn"
								}, {
									default: withCtx(() => [createTextVNode(" Просмотр ")]),
									_: 1
								}, 8, ["href"]), mode.value === "reports" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
									createVNode("button", {
										onClick: ($event) => dismissPostReports(post.id),
										class: "btn btn-dismiss",
										disabled: deleting.value === post.id
									}, toDisplayString(deleting.value === post.id ? "..." : "Игнорировать"), 9, ["onClick", "disabled"]),
									createVNode("button", {
										onClick: ($event) => warnPost(post.id),
										class: "btn btn-warn",
										disabled: deleting.value === post.id
									}, " Предупреждение ", 8, ["onClick", "disabled"]),
									createVNode("button", {
										onClick: ($event) => hidePost(post.id),
										class: "btn btn-danger",
										disabled: deleting.value === post.id
									}, " Скрыть ", 8, ["onClick", "disabled"])
								], 64)) : (openBlock(), createBlock("button", {
									key: 1,
									onClick: ($event) => deletePost(post.id),
									class: "btn btn-danger",
									disabled: deleting.value === post.id
								}, toDisplayString(deleting.value === post.id ? "Удаление..." : "Удалить"), 9, ["onClick", "disabled"]))])
							]);
						}), 128)), filteredPosts.value.length === 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "no-results"
						}, toDisplayString(mode.value === "reports" ? "Нет жалоб на посты" : "Посты не найдены"), 1)) : createCommentVNode("", true)]))
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$18 = _sfc_main$18.setup;
_sfc_main$18.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Posts.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
var Posts_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$18, [["__scopeId", "data-v-ba772c4e"]]);
//#endregion
//#region resources/js/Pages/Admin/Users.vue
var Users_exports = /* @__PURE__ */ __exportAll({ default: () => Users_default });
var DEFAULT_AVATAR = "/images/User-avatar.png";
var _sfc_main$17 = {
	__name: "Users",
	__ssrInlineRender: true,
	props: { mode: {
		type: String,
		default: "users"
	} },
	setup(__props) {
		const props = __props;
		let adminLink = null;
		let adminScript = null;
		const users = ref([]);
		const searchQuery = ref("");
		const loading = ref(true);
		const error = ref(null);
		const sendingMessage = ref(null);
		const processingUser = ref(null);
		const rejectingUserId = ref(null);
		const rejectionReason = ref("");
		const pendingCount = ref(0);
		const openRejections = ref({});
		const openReports = ref({});
		const mode = computed(() => props.mode || "users");
		const getPageTitle = () => {
			if (mode.value === "verification") return "Список заявок на получение подтвержденного аккаунта";
			if (mode.value === "reports") return "Жалобы на пользователей";
			return "Управление пользователями";
		};
		const filteredUsers = computed(() => {
			if (!searchQuery.value) return users.value;
			const query = searchQuery.value.toLowerCase();
			return users.value.filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));
		});
		const fetchUsers = async () => {
			try {
				loading.value = true;
				error.value = null;
				let params = "";
				if (mode.value === "verification") params = "?mode=verification";
				else if (mode.value === "reports") params = "?mode=reports";
				const response = await axios$1.get(`/admin/users/data${params}`);
				users.value = response.data.users || response.data;
				if (mode.value === "verification") pendingCount.value = users.value.length;
			} catch (err) {
				console.error("Ошибка загрузки пользователей:", err);
				error.value = "Не удалось загрузить пользователей";
			} finally {
				loading.value = false;
			}
		};
		const getUserAvatar = (user) => {
			if (user.avatar) return `/storage/${user.avatar}`;
			return DEFAULT_AVATAR;
		};
		const handleImageError = (event) => {
			event.target.src = DEFAULT_AVATAR;
		};
		const startConversation = async (userId) => {
			try {
				sendingMessage.value = userId;
				const response = await axios$1.get(`/chats/start/${userId}`);
				if (response.data.conversation_id) router.visit(`/messages/${response.data.conversation_id}`);
				else router.visit("/messages");
			} catch (err) {
				console.error("Ошибка создания диалога:", err);
				alert("Не удалось начать диалог");
			} finally {
				sendingMessage.value = null;
			}
		};
		const toggleRejections = (userId) => {
			openRejections.value[userId] = !openRejections.value[userId];
		};
		const formatDate = (dateString) => {
			return new Date(dateString).toLocaleDateString("ru-RU", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const approveUser = async (userId) => {
			try {
				processingUser.value = userId;
				await axios$1.post(`/admin/users/${userId}/approve`);
				users.value = users.value.filter((u) => u.id !== userId);
				pendingCount.value = Math.max(0, pendingCount.value - 1);
			} catch (err) {
				console.error("Ошибка одобрения:", err);
				alert("Не удалось одобрить заявку");
			} finally {
				processingUser.value = null;
			}
		};
		const showRejectModal = (userId) => {
			rejectingUserId.value = userId;
			rejectionReason.value = "";
		};
		const closeRejectModal = () => {
			rejectingUserId.value = null;
			rejectionReason.value = "";
		};
		const confirmReject = async () => {
			if (!rejectionReason.value.trim()) return;
			try {
				processingUser.value = rejectingUserId.value;
				await axios$1.post(`/admin/users/${rejectingUserId.value}/reject`, { reason: rejectionReason.value });
				users.value = users.value.filter((u) => u.id !== rejectingUserId.value);
				pendingCount.value = Math.max(0, pendingCount.value - 1);
				closeRejectModal();
			} catch (err) {
				console.error("Ошибка отказа:", err);
				alert("Не удалось отклонить заявку");
			} finally {
				processingUser.value = null;
			}
		};
		const toggleReports = (userId) => {
			openReports.value[userId] = !openReports.value[userId];
		};
		const dismissUserReports = async (userId) => {
			try {
				processingUser.value = userId;
				await axios$1.post(`/admin/users/${userId}/dismiss-reports`);
				users.value = users.value.filter((u) => u.id !== userId);
			} catch (err) {
				console.error("Ошибка игнорирования жалоб:", err);
				alert("Не удалось игнорировать жалобы");
			} finally {
				processingUser.value = null;
			}
		};
		const deleteUser = async (userId) => {
			if (!confirm("Вы уверены, что хотите заблокировать этого пользователя?")) return;
			try {
				processingUser.value = userId;
				await axios$1.delete(`/admin/users/${userId}`);
				users.value = users.value.filter((u) => u.id !== userId);
				alert("Пользователь заблокирован");
			} catch (err) {
				console.error("Ошибка блокировки пользователя:", err);
				alert("Не удалось заблокировать пользователя");
			} finally {
				processingUser.value = null;
			}
		};
		const handleSearch = () => {};
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
			adminScript = document.createElement("script");
			adminScript.src = "/js/admin.js";
			document.body.appendChild(adminScript);
			fetchUsers();
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
			if (adminScript) {
				document.body.removeChild(adminScript);
				adminScript = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-7198bceb${_scopeId}><h1 data-v-7198bceb${_scopeId}>${ssrInterpolate(getPageTitle())}</h1><div class="admin-nav" data-v-7198bceb${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: mode.value === "reports" ? "/admin/users?mode=reports" : "/admin/users",
							class: ["admin-nav-item", { active: mode.value !== "reports" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/posts",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/comments",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="search-container" data-v-7198bceb${_scopeId}><input type="text" id="userSearch"${ssrRenderAttr("value", searchQuery.value)} placeholder="Поиск пользователя..." data-v-7198bceb${_scopeId}></div>`);
						if (loading.value) _push(`<div class="loading" data-v-7198bceb${_scopeId}> Загрузка... </div>`);
						else if (error.value) _push(`<div class="error" data-v-7198bceb${_scopeId}>${ssrInterpolate(error.value)}</div>`);
						else {
							_push(`<div class="users-list" data-v-7198bceb${_scopeId}><!--[-->`);
							ssrRenderList(filteredUsers.value, (user) => {
								_push(`<div class="user-item" data-v-7198bceb${_scopeId}><img${ssrRenderAttr("src", getUserAvatar(user))}${ssrRenderAttr("alt", user.name)} class="user-avatar" data-v-7198bceb${_scopeId}><div class="user-info" data-v-7198bceb${_scopeId}><h3 data-v-7198bceb${_scopeId}>${ssrInterpolate(user.name)}</h3><p data-v-7198bceb${_scopeId}>${ssrInterpolate(user.email)}</p>`);
								if (user.phone) _push(`<p class="user-phone" data-v-7198bceb${_scopeId}>${ssrInterpolate(user.phone)}</p>`);
								else _push(`<!---->`);
								if (mode.value === "verification") {
									_push(`<div class="verification-info" data-v-7198bceb${_scopeId}><button class="attempts-toggle" data-v-7198bceb${_scopeId}> Кол-во попыток получить верификацию: ${ssrInterpolate(user.verification_attempts || 0)} <span class="${ssrRenderClass([{ open: openRejections.value[user.id] }, "arrow"])}" data-v-7198bceb${_scopeId}>▼</span></button>`);
									if (openRejections.value[user.id] && user.verification_rejections?.length) {
										_push(`<div class="rejections-dropdown" data-v-7198bceb${_scopeId}><!--[-->`);
										ssrRenderList(user.verification_rejections, (rejection) => {
											_push(`<div class="rejection-item" data-v-7198bceb${_scopeId}><div class="rejection-date" data-v-7198bceb${_scopeId}>${ssrInterpolate(formatDate(rejection.rejected_at))}</div><div class="rejection-reason" data-v-7198bceb${_scopeId}>${ssrInterpolate(rejection.reason)}</div></div>`);
										});
										_push(`<!--]--></div>`);
									} else if (openRejections.value[user.id]) _push(`<div class="no-rejections" data-v-7198bceb${_scopeId}> История отказов пуста </div>`);
									else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								if (mode.value === "reports" && user.reports?.length) {
									_push(`<div class="reports-info" data-v-7198bceb${_scopeId}><p class="reports-count" data-v-7198bceb${_scopeId}>Жалоб: ${ssrInterpolate(user.reports.length)}</p><button class="attempts-toggle" data-v-7198bceb${_scopeId}> Подробнее <span class="${ssrRenderClass([{ open: openReports.value[user.id] }, "arrow"])}" data-v-7198bceb${_scopeId}>▼</span></button>`);
									if (openReports.value[user.id]) {
										_push(`<div class="rejections-dropdown" data-v-7198bceb${_scopeId}><!--[-->`);
										ssrRenderList(user.reports, (report) => {
											_push(`<div class="rejection-item" data-v-7198bceb${_scopeId}><div class="rejection-date" data-v-7198bceb${_scopeId}>${ssrInterpolate(formatDate(report.created_at))}</div><div class="rejection-reason" data-v-7198bceb${_scopeId}>${ssrInterpolate(report.reason)}</div><div class="reporter-info" data-v-7198bceb${_scopeId}>От: ${ssrInterpolate(report.reporter?.name || "Неизвестный")}</div></div>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="user-actions" data-v-7198bceb${_scopeId}>`);
								_push(ssrRenderComponent(unref(Link), {
									href: `/profile/${user.id}`,
									class: "btn"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Профиль `);
										else return [createTextVNode(" Профиль ")];
									}),
									_: 2
								}, _parent, _scopeId));
								if (mode.value === "verification") _push(`<!--[--><button class="btn btn-approve"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-7198bceb${_scopeId}>${ssrInterpolate(processingUser.value === user.id ? "..." : "Одобрить")}</button><button class="btn btn-reject"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-7198bceb${_scopeId}> Отказать </button><!--]-->`);
								else if (mode.value === "reports") _push(`<!--[--><button class="btn btn-dismiss"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-7198bceb${_scopeId}>${ssrInterpolate(processingUser.value === user.id ? "..." : "Игнорировать")}</button><button class="btn btn-danger"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-7198bceb${_scopeId}> Заблокировать </button><!--]-->`);
								else _push(`<button class="btn"${ssrIncludeBooleanAttr(sendingMessage.value === user.id) ? " disabled" : ""} data-v-7198bceb${_scopeId}>${ssrInterpolate(sendingMessage.value === user.id ? "Отправка..." : "Сообщение")}</button>`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
							if (filteredUsers.value.length === 0) _push(`<div class="no-results" data-v-7198bceb${_scopeId}>${ssrInterpolate(mode.value === "verification" ? "Заявок на подтверждение нет" : mode.value === "reports" ? "Нет жалоб на пользователей" : "Пользователи не найдены")}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						}
						if (rejectingUserId.value) _push(`<div class="modal-overlay" data-v-7198bceb${_scopeId}><div class="modal" data-v-7198bceb${_scopeId}><h3 data-v-7198bceb${_scopeId}>Укажите причину отказа</h3><textarea placeholder="Причина отказа..." rows="4" data-v-7198bceb${_scopeId}>${ssrInterpolate(rejectionReason.value)}</textarea><div class="modal-actions" data-v-7198bceb${_scopeId}><button class="btn btn-cancel" data-v-7198bceb${_scopeId}>Отмена</button><button class="btn btn-reject"${ssrIncludeBooleanAttr(!rejectionReason.value.trim()) ? " disabled" : ""} data-v-7198bceb${_scopeId}> Отправить </button></div></div></div>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, toDisplayString(getPageTitle()), 1),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: mode.value === "reports" ? "/admin/users?mode=reports" : "/admin/users",
								class: ["admin-nav-item", { active: mode.value !== "reports" }]
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}, 8, ["href", "class"]),
							createVNode(unref(Link), {
								href: "/admin/posts",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/comments",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							})
						]),
						createVNode("div", { class: "search-container" }, [withDirectives(createVNode("input", {
							type: "text",
							id: "userSearch",
							"onUpdate:modelValue": ($event) => searchQuery.value = $event,
							placeholder: "Поиск пользователя...",
							onInput: handleSearch
						}, null, 40, ["onUpdate:modelValue"]), [[vModelText, searchQuery.value]])]),
						loading.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "loading"
						}, " Загрузка... ")) : error.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "error"
						}, toDisplayString(error.value), 1)) : (openBlock(), createBlock("div", {
							key: 2,
							class: "users-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredUsers.value, (user) => {
							return openBlock(), createBlock("div", {
								key: user.id,
								class: "user-item"
							}, [
								createVNode("img", {
									src: getUserAvatar(user),
									alt: user.name,
									class: "user-avatar",
									onError: handleImageError
								}, null, 40, ["src", "alt"]),
								createVNode("div", { class: "user-info" }, [
									createVNode("h3", null, toDisplayString(user.name), 1),
									createVNode("p", null, toDisplayString(user.email), 1),
									user.phone ? (openBlock(), createBlock("p", {
										key: 0,
										class: "user-phone"
									}, toDisplayString(user.phone), 1)) : createCommentVNode("", true),
									mode.value === "verification" ? (openBlock(), createBlock("div", {
										key: 1,
										class: "verification-info"
									}, [createVNode("button", {
										class: "attempts-toggle",
										onClick: ($event) => toggleRejections(user.id)
									}, [createTextVNode(" Кол-во попыток получить верификацию: " + toDisplayString(user.verification_attempts || 0) + " ", 1), createVNode("span", { class: ["arrow", { open: openRejections.value[user.id] }] }, "▼", 2)], 8, ["onClick"]), openRejections.value[user.id] && user.verification_rejections?.length ? (openBlock(), createBlock("div", {
										key: 0,
										class: "rejections-dropdown"
									}, [(openBlock(true), createBlock(Fragment, null, renderList(user.verification_rejections, (rejection) => {
										return openBlock(), createBlock("div", {
											key: rejection.id,
											class: "rejection-item"
										}, [createVNode("div", { class: "rejection-date" }, toDisplayString(formatDate(rejection.rejected_at)), 1), createVNode("div", { class: "rejection-reason" }, toDisplayString(rejection.reason), 1)]);
									}), 128))])) : openRejections.value[user.id] ? (openBlock(), createBlock("div", {
										key: 1,
										class: "no-rejections"
									}, " История отказов пуста ")) : createCommentVNode("", true)])) : createCommentVNode("", true),
									mode.value === "reports" && user.reports?.length ? (openBlock(), createBlock("div", {
										key: 2,
										class: "reports-info"
									}, [
										createVNode("p", { class: "reports-count" }, "Жалоб: " + toDisplayString(user.reports.length), 1),
										createVNode("button", {
											class: "attempts-toggle",
											onClick: ($event) => toggleReports(user.id)
										}, [createTextVNode(" Подробнее "), createVNode("span", { class: ["arrow", { open: openReports.value[user.id] }] }, "▼", 2)], 8, ["onClick"]),
										openReports.value[user.id] ? (openBlock(), createBlock("div", {
											key: 0,
											class: "rejections-dropdown"
										}, [(openBlock(true), createBlock(Fragment, null, renderList(user.reports, (report) => {
											return openBlock(), createBlock("div", {
												key: report.id,
												class: "rejection-item"
											}, [
												createVNode("div", { class: "rejection-date" }, toDisplayString(formatDate(report.created_at)), 1),
												createVNode("div", { class: "rejection-reason" }, toDisplayString(report.reason), 1),
												createVNode("div", { class: "reporter-info" }, "От: " + toDisplayString(report.reporter?.name || "Неизвестный"), 1)
											]);
										}), 128))])) : createCommentVNode("", true)
									])) : createCommentVNode("", true)
								]),
								createVNode("div", { class: "user-actions" }, [createVNode(unref(Link), {
									href: `/profile/${user.id}`,
									class: "btn"
								}, {
									default: withCtx(() => [createTextVNode(" Профиль ")]),
									_: 1
								}, 8, ["href"]), mode.value === "verification" ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("button", {
									onClick: ($event) => approveUser(user.id),
									class: "btn btn-approve",
									disabled: processingUser.value === user.id
								}, toDisplayString(processingUser.value === user.id ? "..." : "Одобрить"), 9, ["onClick", "disabled"]), createVNode("button", {
									onClick: ($event) => showRejectModal(user.id),
									class: "btn btn-reject",
									disabled: processingUser.value === user.id
								}, " Отказать ", 8, ["onClick", "disabled"])], 64)) : mode.value === "reports" ? (openBlock(), createBlock(Fragment, { key: 1 }, [createVNode("button", {
									onClick: ($event) => dismissUserReports(user.id),
									class: "btn btn-dismiss",
									disabled: processingUser.value === user.id
								}, toDisplayString(processingUser.value === user.id ? "..." : "Игнорировать"), 9, ["onClick", "disabled"]), createVNode("button", {
									onClick: ($event) => deleteUser(user.id),
									class: "btn btn-danger",
									disabled: processingUser.value === user.id
								}, " Заблокировать ", 8, ["onClick", "disabled"])], 64)) : (openBlock(), createBlock("button", {
									key: 2,
									onClick: ($event) => startConversation(user.id),
									class: "btn",
									disabled: sendingMessage.value === user.id
								}, toDisplayString(sendingMessage.value === user.id ? "Отправка..." : "Сообщение"), 9, ["onClick", "disabled"]))])
							]);
						}), 128)), filteredUsers.value.length === 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "no-results"
						}, toDisplayString(mode.value === "verification" ? "Заявок на подтверждение нет" : mode.value === "reports" ? "Нет жалоб на пользователей" : "Пользователи не найдены"), 1)) : createCommentVNode("", true)])),
						rejectingUserId.value ? (openBlock(), createBlock("div", {
							key: 3,
							class: "modal-overlay",
							onClick: withModifiers(closeRejectModal, ["self"])
						}, [createVNode("div", { class: "modal" }, [
							createVNode("h3", null, "Укажите причину отказа"),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => rejectionReason.value = $event,
								placeholder: "Причина отказа...",
								rows: "4"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, rejectionReason.value]]),
							createVNode("div", { class: "modal-actions" }, [createVNode("button", {
								onClick: closeRejectModal,
								class: "btn btn-cancel"
							}, "Отмена"), createVNode("button", {
								onClick: confirmReject,
								class: "btn btn-reject",
								disabled: !rejectionReason.value.trim()
							}, " Отправить ", 8, ["disabled"])])
						])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$17 = _sfc_main$17.setup;
_sfc_main$17.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Users.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
var Users_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$17, [["__scopeId", "data-v-7198bceb"]]);
//#endregion
//#region resources/js/composables/useSkills.js
function getSkillClass(skillName) {
	const name = skillName.toLowerCase();
	if (name.includes("php")) return "skill-php";
	if (name.includes("laravel")) return "skill-laravel";
	if (name.includes("vue")) return "skill-vue";
	if (name.includes("js") || name.includes("javascript")) return "skill-js";
	if (name.includes("react")) return "skill-react";
	if (name.includes("node")) return "skill-node";
	if (name.includes("python")) return "skill-python";
	if (name.includes("django")) return "skill-django";
	if (name.includes("design") || name.includes("ui")) return "skill-design";
	if (name.includes("figma")) return "skill-figma";
	if (name.includes("photoshop") || name.includes("illustrator")) return "skill-photoshop";
	if (name.includes("copy") || name.includes("content")) return "skill-copywriting";
	if (name.includes("marketing") || name.includes("seo") || name.includes("smm")) return "skill-marketing";
	if (name.includes("video")) return "skill-video";
	if (name.includes("3d")) return "skill-3d";
	if (name.includes("animation") || name.includes("motion")) return "skill-animation";
	if (name.includes("translation")) return "skill-translation";
	if (name.includes("data") || name.includes("excel")) return "skill-data";
	return "skill-default";
}
//#endregion
//#region resources/js/Components/SkillsSelector.vue
var _sfc_main$16 = {
	__name: "SkillsSelector",
	__ssrInlineRender: true,
	props: {
		skills: {
			type: Array,
			default: () => []
		},
		modelValue: {
			type: Array,
			default: () => []
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const dropdownOpen = ref(false);
		const selectedSkills = ref([...props.modelValue]);
		watch(() => props.modelValue, (newVal) => {
			selectedSkills.value = [...newVal];
		}, { deep: true });
		const isSkillSelected = (skillId) => {
			return selectedSkills.value.some((s) => s.id === skillId);
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)} data-v-197eee3a><div class="form-row" data-v-197eee3a><div class="form-group" data-v-197eee3a><div class="multiselect-container" data-v-197eee3a><div class="multiselect-trigger" data-v-197eee3a>`);
			if (selectedSkills.value.length === 0) _push(`<span data-v-197eee3a>Выберите навыки</span>`);
			else _push(`<span data-v-197eee3a>Выбрано: ${ssrInterpolate(selectedSkills.value.length)}</span>`);
			_push(`<span class="arrow" data-v-197eee3a>▼</span></div>`);
			if (dropdownOpen.value) {
				_push(`<div class="multiselect-dropdown" data-v-197eee3a><!--[-->`);
				ssrRenderList(__props.skills, (skill) => {
					_push(`<div class="${ssrRenderClass([{ selected: isSkillSelected(skill.id) }, "multiselect-option"])}" data-v-197eee3a><span class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-name"])}" data-v-197eee3a>${ssrInterpolate(skill.name)}</span>`);
					if (isSkillSelected(skill.id)) _push(`<span class="check" data-v-197eee3a>✓</span>`);
					else _push(`<!---->`);
					_push(`</div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div></div></div>`);
			if (selectedSkills.value.length > 0) {
				_push(`<div class="selected-skills" data-v-197eee3a><!--[-->`);
				ssrRenderList(selectedSkills.value, (skill) => {
					_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-197eee3a><span class="skill-name" data-v-197eee3a>${ssrInterpolate(skill.name)}</span><div class="skill-level" data-v-197eee3a><select${ssrRenderAttr("value", skill.level)} data-v-197eee3a><option value="1" data-v-197eee3a>1</option><option value="2" data-v-197eee3a>2</option><option value="3" data-v-197eee3a>3</option><option value="4" data-v-197eee3a>4</option><option value="5" data-v-197eee3a>5</option></select></div><button type="button" class="remove-skill" data-v-197eee3a>×</button></div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$16 = _sfc_main$16.setup;
_sfc_main$16.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/SkillsSelector.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
var SkillsSelector_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$16, [["__scopeId", "data-v-197eee3a"]]);
//#endregion
//#region resources/js/Pages/Auth/Auth.vue
var Auth_exports = /* @__PURE__ */ __exportAll({ default: () => Auth_default });
var _sfc_main$15 = /* @__PURE__ */ Object.assign({ layout: _sfc_main$21 }, {
	__name: "Auth",
	__ssrInlineRender: true,
	props: {
		errors: Object,
		skills: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const mode = ref("login");
		const currentStep = ref(1);
		const loginError = ref("");
		const avatarPreview = ref("");
		const loginForm = useForm({
			email: "",
			password: ""
		});
		const registerForm = useForm({
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			avatar: null,
			bio: "",
			skills: [],
			phone: "",
			resume: null,
			passport: null,
			certificates: null,
			email_confirmed: false,
			request_verification: false
		});
		const registerData = reactive({
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			avatar: null,
			bio: "",
			skills: [],
			phone: "",
			resume: null,
			passport: null,
			certificates: null,
			email_confirmed: false,
			request_verification: false
		});
		const validationErrors = reactive({ step1: "" });
		const registerErrors = ref([]);
		watch(() => props.errors, (newErrors) => {
			registerErrors.value = newErrors ? Object.values(newErrors).flat() : [];
		}, {
			immediate: true,
			deep: true
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: mode.value === "login" ? "Вход" : "Регистрация" }, null, _parent));
			_push(`<div class="${ssrRenderClass([{ "register-mode": mode.value === "register" }, "Authblock"])}" data-v-3e054f62><div class="form-wrapper" data-v-3e054f62>`);
			if (mode.value === "login") {
				_push(`<form data-v-3e054f62><h1 data-v-3e054f62>Вход</h1>`);
				if (_ctx.$page.props.errors.error) _push(`<div class="error-message global-error" data-v-3e054f62>${ssrInterpolate(_ctx.$page.props.errors.error)}</div>`);
				else _push(`<!---->`);
				_push(`<div class="login-content" data-v-3e054f62><div class="input-group" data-v-3e054f62><label data-v-3e054f62>Email</label><input type="email"${ssrRenderAttr("value", unref(loginForm).email)} placeholder="Введите email" required data-v-3e054f62></div><div class="input-group" data-v-3e054f62><label data-v-3e054f62>Пароль</label><input type="password"${ssrRenderAttr("value", unref(loginForm).password)} placeholder="Введите пароль" required data-v-3e054f62>`);
				if (loginError.value) _push(`<div class="field-error" data-v-3e054f62>${ssrInterpolate(loginError.value)}</div>`);
				else _push(`<!---->`);
				_push(`</div></div><button type="submit"${ssrIncludeBooleanAttr(unref(loginForm).processing) ? " disabled" : ""} data-v-3e054f62>${ssrInterpolate(unref(loginForm).processing ? "Вход..." : "Войти")}</button><button type="button" class="switch-mode" data-v-3e054f62> Нет аккаунта? Зарегистрироваться </button><div class="oauth-divider" data-v-3e054f62><span data-v-3e054f62>Или</span></div><div class="oauth-buttons" data-v-3e054f62><a href="/auth/google/redirect" class="oauth-btn oauth-google" data-inertia="false" data-v-3e054f62><img src="/images/google.svg" alt="" data-v-3e054f62> Войти через Google </a><a href="/auth/github/redirect" class="oauth-btn oauth-github" data-inertia="false" data-v-3e054f62><img src="/images/github.svg" alt="" data-v-3e054f62> Войти через GitHub </a></div></form>`);
			} else {
				_push(`<form class="register-form" data-v-3e054f62><h1 data-v-3e054f62>Регистрация</h1><div class="step-indicator" data-v-3e054f62><!--[-->`);
				ssrRenderList(3, (step) => {
					_push(`<div class="${ssrRenderClass([{
						active: currentStep.value === step,
						completed: currentStep.value > step
					}, "step-dot"])}" data-v-3e054f62></div>`);
				});
				_push(`<!--]--></div><div class="step-content" data-v-3e054f62>`);
				if (currentStep.value === 1) {
					_push(`<div class="step step-1" data-v-3e054f62><div class="input-group" data-v-3e054f62><label data-v-3e054f62>Имя</label><input type="text"${ssrRenderAttr("value", registerData.name)} placeholder="Введите имя" required data-v-3e054f62></div><div class="input-group" data-v-3e054f62><label data-v-3e054f62>Email</label><input type="email"${ssrRenderAttr("value", registerData.email)} placeholder="Введите email" required data-v-3e054f62></div><div class="input-group" data-v-3e054f62><label data-v-3e054f62>Пароль</label><input type="password"${ssrRenderAttr("value", registerData.password)} placeholder="Минимум 8 символов" required data-v-3e054f62></div><div class="input-group" data-v-3e054f62><label data-v-3e054f62>Подтверждение пароля</label><input type="password"${ssrRenderAttr("value", registerData.password_confirmation)} placeholder="Повторите пароль" required data-v-3e054f62></div>`);
					if (validationErrors.step1) _push(`<div class="error-message" data-v-3e054f62>${ssrInterpolate(validationErrors.step1)}</div>`);
					else _push(`<!---->`);
					if (registerErrors.value.length > 0) {
						_push(`<div class="error-message" data-v-3e054f62><!--[-->`);
						ssrRenderList(registerErrors.value, (err) => {
							_push(`<div data-v-3e054f62>${ssrInterpolate(err)}</div>`);
						});
						_push(`<!--]--></div>`);
					} else _push(`<!---->`);
					_push(`</div>`);
				} else if (currentStep.value === 2) {
					_push(`<div class="step step-2" data-v-3e054f62><p class="optional-notice" data-v-3e054f62>Опционально — вы сможете поменять данные в настройках личного кабинета</p><div class="avatar-upload" data-v-3e054f62><label data-v-3e054f62>Аватар</label><div class="avatar-preview" data-v-3e054f62>`);
					if (avatarPreview.value) _push(`<img${ssrRenderAttr("src", avatarPreview.value)} alt="Avatar preview" data-v-3e054f62>`);
					else _push(`<span class="avatar-placeholder" data-v-3e054f62>Нажмите для загрузки</span>`);
					_push(`</div><input type="file" accept="image/*" hidden data-v-3e054f62>`);
					if (avatarPreview.value) _push(`<button type="button" class="remove-avatar" data-v-3e054f62>Удалить</button>`);
					else _push(`<!---->`);
					_push(`</div><div class="form-group" data-v-3e054f62><label data-v-3e054f62>О себе</label><textarea placeholder="Расскажите о себе..." rows="4" data-v-3e054f62>${ssrInterpolate(registerData.bio)}</textarea></div><div class="form-group" data-v-3e054f62><div class="label-with-tooltip" data-v-3e054f62><label data-v-3e054f62>Навыки</label><div class="tooltip-trigger" data-v-3e054f62><span class="help-icon" data-v-3e054f62>?</span><div class="tooltip-content" data-v-3e054f62> Выберите навыки, которыми вы владеете. Это поможет работодателям найти вас по соответствующим вакансиям. </div></div></div>`);
					_push(ssrRenderComponent(SkillsSelector_default, {
						modelValue: registerData.skills,
						"onUpdate:modelValue": ($event) => registerData.skills = $event,
						skills: __props.skills
					}, null, _parent));
					if (registerData.skills.length > 0) {
						_push(`<div class="selected-skills" data-v-3e054f62><!--[-->`);
						ssrRenderList(registerData.skills, (skill) => {
							_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-3e054f62><span class="skill-name" data-v-3e054f62>${ssrInterpolate(skill.name)}</span><button type="button" class="remove-skill" data-v-3e054f62>×</button></div>`);
						});
						_push(`<!--]--></div>`);
					} else _push(`<!---->`);
					_push(`</div></div>`);
				} else if (currentStep.value === 3) {
					_push(`<div class="step step-3" data-v-3e054f62><p class="optional-notice" data-v-3e054f62>Опционально — повысьте шансы на трудоустройство</p><div class="form-group" data-v-3e054f62><label data-v-3e054f62>Телефон</label><div class="phone-input-wrapper" data-v-3e054f62><input type="tel"${ssrRenderAttr("value", registerData.phone)} placeholder="+7 (___) ___-__-__" data-v-3e054f62><span class="phone-hint" data-v-3e054f62>Пригодится для двухфакторной аутентификации</span></div></div><div class="form-group" data-v-3e054f62><label data-v-3e054f62>Резюме</label><div class="file-upload" data-v-3e054f62>`);
					if (registerData.resume) _push(`<span data-v-3e054f62>${ssrInterpolate(registerData.resume.name)}</span>`);
					else _push(`<span data-v-3e054f62>Нажмите для загрузки PDF, DOC, DOCX</span>`);
					_push(`</div><input type="file" accept=".pdf,.doc,.docx" hidden data-v-3e054f62></div><div class="form-group" data-v-3e054f62><label data-v-3e054f62>Паспорт</label><div class="file-upload" data-v-3e054f62>`);
					if (registerData.passport) _push(`<span data-v-3e054f62>${ssrInterpolate(registerData.passport.name)}</span>`);
					else _push(`<span data-v-3e054f62>Загрузите скан паспорта или сфоткайте разворот</span>`);
					_push(`</div><input type="file" accept="image/*,.pdf" hidden data-v-3e054f62></div><div class="form-group" data-v-3e054f62><label data-v-3e054f62>Диплом/Сертификаты</label><div class="file-upload" data-v-3e054f62>`);
					if (registerData.certificates) _push(`<span data-v-3e054f62>${ssrInterpolate(registerData.certificates.name)}</span>`);
					else _push(`<span data-v-3e054f62>Загрузите документы об образовании</span>`);
					_push(`</div><input type="file" accept="image/*,.pdf" hidden data-v-3e054f62><span class="phone-hint" data-v-3e054f62>(Вы сможете найти их в настройках в вкладке Мои файлы) </span></div><div class="checkbox-group" data-v-3e054f62><label class="checkbox-label" data-v-3e054f62><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(registerData.email_confirmed) ? ssrLooseContain(registerData.email_confirmed, null) : registerData.email_confirmed) ? " checked" : ""} data-v-3e054f62><span data-v-3e054f62>Подтвердить email</span></label></div><div class="checkbox-group" data-v-3e054f62><label class="checkbox-label verification-label" data-v-3e054f62><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(registerData.request_verification) ? ssrLooseContain(registerData.request_verification, null) : registerData.request_verification) ? " checked" : ""} data-v-3e054f62><span data-v-3e054f62>Запросить верификацию аккаунта</span><div class="tooltip-trigger" data-v-3e054f62><span class="help-icon" data-v-3e054f62>?</span><div class="tooltip-content" data-v-3e054f62> Верификация добавит галочку <img src="/images/verified.svg" alt="" data-v-3e054f62> рядом с вашим именем, что повысит доверие работодателей. </div></div></label></div></div>`);
				} else _push(`<!---->`);
				_push(`</div><div class="form-actions" data-v-3e054f62>`);
				if (currentStep.value > 1) _push(`<button type="button" class="btn-back" data-v-3e054f62> Назад </button>`);
				else _push(`<!---->`);
				if (currentStep.value < 3) _push(`<button type="button" class="btn-next" data-v-3e054f62> Далее </button>`);
				else _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(registerForm).processing) ? " disabled" : ""} class="btn-submit" data-v-3e054f62>${ssrInterpolate(unref(registerForm).processing ? "Регистрация..." : "Зарегистрироваться")}</button>`);
				_push(`</div><button type="button" class="switch-mode" data-v-3e054f62> Уже есть аккаунт? Войти </button></form>`);
			}
			_push(`</div></div><!--]-->`);
		};
	}
});
var _sfc_setup$15 = _sfc_main$15.setup;
_sfc_main$15.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Auth.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
var Auth_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$15, [["__scopeId", "data-v-3e054f62"]]);
//#endregion
//#region resources/js/Pages/Balance/Index.vue
var Index_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Index_default$1 });
var _sfc_main$14 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: { balance: {
		type: [Number, String],
		default: 0
	} },
	setup(__props) {
		const page = usePage();
		computed(() => page.props.auth?.user || page.props.user || null);
		const quickAmounts = [
			100,
			300,
			500,
			1e3,
			3e3,
			5e3
		];
		const withdrawalAmounts = [
			100,
			300,
			500,
			1e3,
			3e3,
			5e3
		];
		const isWithdrawal = ref(false);
		const form = useForm({ amount: "" });
		const submitBalance = () => {
			const url = isWithdrawal.value ? "/balance/withdraw" : "/balance/add";
			form.post(url, {
				preserveScroll: true,
				onSuccess: () => {
					form.reset();
				}
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Пополнение баланса" }, null, _parent, _scopeId));
						_push(`<div class="balance-page" data-v-fee6bedc${_scopeId}><div class="balance-container" data-v-fee6bedc${_scopeId}><div class="back-link" data-v-fee6bedc${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "#",
							onclick: "history.back(); return false;"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` ← Назад `);
								else return [createTextVNode(" ← Назад ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="balance-card" data-v-fee6bedc${_scopeId}><h1 data-v-fee6bedc${_scopeId}>${ssrInterpolate(isWithdrawal.value ? "Снятие средств" : "Пополнение баланса")}</h1><div class="current-balance" data-v-fee6bedc${_scopeId}><span class="label" data-v-fee6bedc${_scopeId}>Текущий баланс:</span><span class="amount" data-v-fee6bedc${_scopeId}>${ssrInterpolate(Number(__props.balance))} ₽</span></div><div class="type-toggle" data-v-fee6bedc${_scopeId}><button class="${ssrRenderClass({ active: !isWithdrawal.value })}" data-v-fee6bedc${_scopeId}> Пополнение </button><button class="${ssrRenderClass({ active: isWithdrawal.value })}"${ssrIncludeBooleanAttr(Number(__props.balance) <= 0) ? " disabled" : ""} data-v-fee6bedc${_scopeId}> Снятие </button></div><form class="balance-form" data-v-fee6bedc${_scopeId}><div class="form-group" data-v-fee6bedc${_scopeId}><label for="amount" data-v-fee6bedc${_scopeId}>${ssrInterpolate(isWithdrawal.value ? "Сумма снятия:" : "Сумма пополнения:")}</label><input type="number" name="amount" id="amount"${ssrRenderAttr("value", unref(form).amount)}${ssrRenderAttr("min", 1)}${ssrRenderAttr("max", isWithdrawal.value ? Number(__props.balance) : 1e5)} required placeholder="Введите сумму" data-v-fee6bedc${_scopeId}></div>`);
						if (!isWithdrawal.value) {
							_push(`<div class="quick-amounts" data-v-fee6bedc${_scopeId}><!--[-->`);
							ssrRenderList(quickAmounts, (amount) => {
								_push(`<button type="button" class="${ssrRenderClass({ active: unref(form).amount === amount })}" data-v-fee6bedc${_scopeId}>${ssrInterpolate(amount)} ₽ </button>`);
							});
							_push(`<!--]--></div>`);
						} else {
							_push(`<div class="quick-amounts" data-v-fee6bedc${_scopeId}><!--[-->`);
							ssrRenderList(withdrawalAmounts, (amount) => {
								_push(`<button type="button" class="${ssrRenderClass({ active: unref(form).amount === amount })}" data-v-fee6bedc${_scopeId}>${ssrInterpolate(amount)} ₽ </button>`);
							});
							_push(`<!--]--></div>`);
						}
						_push(`<button type="submit" class="btn-submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-fee6bedc${_scopeId}>${ssrInterpolate(unref(form).processing ? isWithdrawal.value ? "Снятие..." : "Пополнение..." : isWithdrawal.value ? "Снять средства" : "Пополнить баланс")}</button></form></div></div></div>`);
					} else return [createVNode(unref(Head), { title: "Пополнение баланса" }), createVNode("div", { class: "balance-page" }, [createVNode("div", { class: "balance-container" }, [createVNode("div", { class: "back-link" }, [createVNode(unref(Link), {
						href: "#",
						onclick: "history.back(); return false;"
					}, {
						default: withCtx(() => [createTextVNode(" ← Назад ")]),
						_: 1
					})]), createVNode("div", { class: "balance-card" }, [
						createVNode("h1", null, toDisplayString(isWithdrawal.value ? "Снятие средств" : "Пополнение баланса"), 1),
						createVNode("div", { class: "current-balance" }, [createVNode("span", { class: "label" }, "Текущий баланс:"), createVNode("span", { class: "amount" }, toDisplayString(Number(__props.balance)) + " ₽", 1)]),
						createVNode("div", { class: "type-toggle" }, [createVNode("button", {
							class: { active: !isWithdrawal.value },
							onClick: ($event) => isWithdrawal.value = false
						}, " Пополнение ", 10, ["onClick"]), createVNode("button", {
							class: { active: isWithdrawal.value },
							onClick: ($event) => isWithdrawal.value = true,
							disabled: Number(__props.balance) <= 0
						}, " Снятие ", 10, ["onClick", "disabled"])]),
						createVNode("form", {
							onSubmit: withModifiers(submitBalance, ["prevent"]),
							class: "balance-form"
						}, [
							createVNode("div", { class: "form-group" }, [createVNode("label", { for: "amount" }, toDisplayString(isWithdrawal.value ? "Сумма снятия:" : "Сумма пополнения:"), 1), withDirectives(createVNode("input", {
								type: "number",
								name: "amount",
								id: "amount",
								"onUpdate:modelValue": ($event) => unref(form).amount = $event,
								min: 1,
								max: isWithdrawal.value ? Number(__props.balance) : 1e5,
								required: "",
								placeholder: "Введите сумму"
							}, null, 8, ["onUpdate:modelValue", "max"]), [[vModelText, unref(form).amount]])]),
							!isWithdrawal.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "quick-amounts"
							}, [(openBlock(), createBlock(Fragment, null, renderList(quickAmounts, (amount) => {
								return createVNode("button", {
									type: "button",
									key: amount,
									onClick: ($event) => unref(form).amount = amount,
									class: { active: unref(form).amount === amount }
								}, toDisplayString(amount) + " ₽ ", 11, ["onClick"]);
							}), 64))])) : (openBlock(), createBlock("div", {
								key: 1,
								class: "quick-amounts"
							}, [(openBlock(), createBlock(Fragment, null, renderList(withdrawalAmounts, (amount) => {
								return createVNode("button", {
									type: "button",
									key: amount,
									onClick: ($event) => unref(form).amount = amount,
									class: { active: unref(form).amount === amount }
								}, toDisplayString(amount) + " ₽ ", 11, ["onClick"]);
							}), 64))])),
							createVNode("button", {
								type: "submit",
								class: "btn-submit",
								disabled: unref(form).processing
							}, toDisplayString(unref(form).processing ? isWithdrawal.value ? "Снятие..." : "Пополнение..." : isWithdrawal.value ? "Снять средства" : "Пополнить баланс"), 9, ["disabled"])
						], 32)
					])])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$14 = _sfc_main$14.setup;
_sfc_main$14.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Balance/Index.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var Index_default$1 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$14, [["__scopeId", "data-v-fee6bedc"]]);
//#endregion
//#region resources/js/composables/usePostPreviewsCache.js
var postPreviewsCache = {};
function addToCache(postId, data) {
	postPreviewsCache[postId] = data;
}
//#endregion
//#region resources/js/Pages/Chat/Chats.vue
var Chats_exports = /* @__PURE__ */ __exportAll({ default: () => Chats_default });
var _sfc_main$13 = {
	__name: "Chats",
	__ssrInlineRender: true,
	props: {
		chats: Array,
		activeChat: {
			type: Object,
			default: null
		}
	},
	setup(__props) {
		const props = __props;
		const page = usePage();
		const form = useForm({
			content: "",
			photo: null,
			video: null,
			document: null
		});
		const textareaRef = ref(null);
		const messagesRef = ref(null);
		const chatArea = ref(null);
		const photoPreviewUrl = ref(null);
		const isApplicationBlockClosed = ref(false);
		const videoPreviewUrl = ref(null);
		const documentPreviewName = ref(null);
		const modalOpen = ref(false);
		const modalImage = ref(null);
		const modalVideo = ref(null);
		const downloadedFiles = ref(/* @__PURE__ */ new Set());
		const slideOffset = ref(0);
		const contextMenu = ref({
			show: false,
			x: 0,
			y: 0,
			message: null
		});
		const rightClickedMessage = ref(null);
		const editingMessage = ref(null);
		const selectedMessages = ref([]);
		const optionsMenu = ref({
			show: false,
			x: 15,
			y: 60
		});
		const onlineUsers = ref(/* @__PURE__ */ new Set());
		const isSliding = ref(false);
		const touchStartX = ref(0);
		const touchCurrentX = ref(0);
		const isSwiping = ref(false);
		const postPreviews = ref(postPreviewsCache);
		const isHydratingChat = ref(false);
		const showSkeleton = ref(false);
		const isSkeletonFading = ref(false);
		const isMessagesStable = ref(false);
		const initialScrollDone = ref(false);
		let stableCheckTimer = null;
		const skeletonItems = computed(() => [
			{
				side: "left",
				lines: [
					"42%",
					"58%",
					"32%"
				],
				hasThirdLine: true
			},
			{
				side: "right",
				lines: ["55%", "40%"],
				hasThirdLine: false
			},
			{
				side: "left",
				lines: ["68%", "34%"],
				hasThirdLine: false
			},
			{
				side: "right",
				lines: [
					"48%",
					"62%",
					"28%"
				],
				hasThirdLine: true
			},
			{
				side: "left",
				lines: ["38%", "52%"],
				hasThirdLine: false
			},
			{
				side: "right",
				lines: ["60%", "44%"],
				hasThirdLine: false
			},
			{
				side: "left",
				lines: [
					"72%",
					"36%",
					"24%"
				],
				hasThirdLine: true
			}
		]);
		const POST_URL_REGEX = /http?:\/\/[^\/\s]+\/posts\/(\d+)/;
		function extractPostIds(content) {
			if (!content) return [];
			const ids = [];
			let match;
			const regex = new RegExp(POST_URL_REGEX.source, "g");
			while ((match = regex.exec(content)) !== null) ids.push(match[1]);
			return [...new Set(ids)];
		}
		function testPostUrl(text) {
			return new RegExp(POST_URL_REGEX.source).test(text);
		}
		async function fetchPostPreview(postId) {
			if (postPreviewsCache[postId]) return;
			postPreviewsCache[postId] = "loading";
			try {
				const res = await fetch(`/api/posts/${postId}/preview`);
				if (!res.ok) throw new Error("not found");
				addToCache(postId, await res.json());
				postPreviews.value = { ...postPreviewsCache };
			} catch {
				postPreviewsCache[postId] = "error";
			}
		}
		async function loadPreviewsForMessages(messages) {
			if (!messages) return;
			const promises = [];
			for (const msg of messages) {
				const ids = extractPostIds(msg.content);
				for (const id of ids) promises.push(fetchPostPreview(id));
			}
			await Promise.all(promises);
		}
		async function hydrateChat(messages) {
			const needsFetch = messages?.some((msg) => {
				return extractPostIds(msg.content).some((id) => !postPreviewsCache[id] || postPreviewsCache[id] === "loading");
			});
			if (stableCheckTimer) clearTimeout(stableCheckTimer);
			if (needsFetch) {
				showSkeleton.value = true;
				isHydratingChat.value = true;
				await loadPreviewsForMessages(messages);
			}
			isMessagesStable.value = false;
			initialScrollDone.value = false;
			let lastHeight = 0;
			let stableCount = 0;
			const STABLE_THRESHOLD = 3;
			const checkStable = () => {
				if (!messagesRef.value) {
					stableCheckTimer = setTimeout(checkStable, 100);
					return;
				}
				const currentHeight = messagesRef.value.scrollHeight;
				if (currentHeight === lastHeight && currentHeight > 0) {
					stableCount++;
					if (stableCount >= STABLE_THRESHOLD) {
						isMessagesStable.value = true;
						scrollToBottom(true);
						initialScrollDone.value = true;
						if (needsFetch) setTimeout(() => {
							isSkeletonFading.value = true;
							setTimeout(() => {
								showSkeleton.value = false;
								isSkeletonFading.value = false;
								isHydratingChat.value = false;
							}, 500);
						}, 500);
						else isHydratingChat.value = false;
						return;
					}
				} else {
					stableCount = 0;
					lastHeight = currentHeight;
				}
				stableCheckTimer = setTimeout(checkStable, 100);
			};
			checkStable();
		}
		function getPostPreviewsFromContent(content) {
			return extractPostIds(content).map((id) => postPreviewsCache[id]).filter((p) => p && p !== "loading" && p !== "error");
		}
		function renderContent(content) {
			if (!content) return "";
			return content.replace(/http?:\/\/[^\/\s]+\/posts\/(\d+)/g, (url, id) => `<a href="/posts/${id}" class="post-link" target="_blank">${url}</a>`);
		}
		function isOnlyPostUrl(content) {
			if (!content) return false;
			const trimmed = content.trim();
			return new RegExp(`^${POST_URL_REGEX.source.replace("\\/", "/").replace("http?", "http?s?")}$`).test(trimmed);
		}
		function truncate(text, length) {
			if (!text) return "";
			return text.length > length ? text.slice(0, length) + "…" : text;
		}
		function getChatPreview(message) {
			if (!message || !message.content) return "";
			if (testPostUrl(message.content.trim())) return message.is_mine ? "Вы поделились постом" : "поделился(лась) постом";
			return truncate(message.content, 30);
		}
		const formatAccountAge = (createdAt) => {
			const created = new Date(createdAt);
			const diffMs = /* @__PURE__ */ new Date() - created;
			const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
			if (diffDays < 30) return `${diffDays} дней назад`;
			if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
			return `${Math.floor(diffDays / 365)} лет назад`;
		};
		const scrollToBottom = (force = false) => {
			nextTick(() => {
				const el = messagesRef.value;
				if (!el) return;
				const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
				if (force || isNearBottom) el.scrollTop = el.scrollHeight;
			});
		};
		const autoResize = () => {
			const el = textareaRef.value;
			if (!el) return;
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		};
		const isMobile = () => window.innerWidth <= 1e3;
		const resetForm = () => {
			form.reset("content", "photo", "video", "document");
			photoPreviewUrl.value = null;
			videoPreviewUrl.value = null;
			documentPreviewName.value = null;
			editingMessage.value = null;
		};
		const acceptApplication = () => {
			router.post(`/applications/${props.activeChat.application.id}/accept`, {}, { preserveScroll: true });
		};
		const rejectApplication = () => {
			router.post(`/applications/${props.activeChat.application.id}/reject`, {}, { preserveScroll: true });
		};
		const otherUsers = computed(() => {
			if (!props.activeChat) return [];
			const currentId = page.props.auth?.user?.id;
			return props.activeChat.users.filter((u) => u.id !== currentId);
		});
		const vacancyPosition = computed(() => {
			if (!props.activeChat || !props.activeChat.application?.vacancy) return null;
			return props.activeChat.application.vacancy.position;
		});
		const vacancyPostId = computed(() => {
			if (!props.activeChat || !props.activeChat.application?.vacancy) return null;
			return props.activeChat.application.vacancy.post_id;
		});
		const showApplicationBlock = computed(() => {
			if (!props.activeChat) return false;
			if (!props.activeChat.application) return false;
			if (props.activeChat.application.status !== "pending") return false;
			return true;
		});
		const isVacancyAuthor = computed(() => {
			if (!props.activeChat || !props.activeChat.application) return false;
			return page.props.auth?.user?.id !== props.activeChat.application.user.id;
		});
		const canDeleteSelected = computed(() => {
			if (selectedMessages.value.length === 0) return false;
			return selectedMessages.value.every((m) => m.is_mine);
		});
		const isUserOnline = (userId) => {
			return onlineUsers.value.has(userId);
		};
		const canSend = computed(() => {
			if (editingMessage.value) return true;
			return form.content && form.content.trim().length > 0 || !!form.photo || !!form.video || !!form.document;
		});
		const openImage = (url) => {
			modalImage.value = url;
			modalVideo.value = null;
			modalOpen.value = true;
		};
		const openVideo = (url) => {
			modalVideo.value = url;
			modalImage.value = null;
			modalOpen.value = true;
		};
		const closeModal = () => {
			modalOpen.value = false;
			modalImage.value = null;
			modalVideo.value = null;
		};
		const cancelPreview = () => {
			form.reset("photo", "video", "document");
			photoPreviewUrl.value = null;
			videoPreviewUrl.value = null;
			documentPreviewName.value = null;
		};
		const selectOtherFile = () => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "*/*";
			input.onchange = (event) => {
				const file = event.target.files[0];
				if (file) {
					form.photo = null;
					form.video = null;
					form.document = null;
					if (file.type.startsWith("image/")) {
						form.photo = file;
						const reader = new FileReader();
						reader.onload = (e) => {
							photoPreviewUrl.value = e.target.result;
							videoPreviewUrl.value = null;
							documentPreviewName.value = null;
						};
						reader.readAsDataURL(file);
					} else if (file.type.startsWith("video/")) {
						form.video = file;
						const reader = new FileReader();
						reader.onload = (e) => {
							videoPreviewUrl.value = e.target.result;
							photoPreviewUrl.value = null;
							documentPreviewName.value = null;
						};
						reader.readAsDataURL(file);
					} else {
						form.document = file;
						documentPreviewName.value = file.name;
						photoPreviewUrl.value = null;
						videoPreviewUrl.value = null;
					}
				}
			};
			input.click();
		};
		const persistDownloaded = () => {
			try {
				const arr = Array.from(downloadedFiles.value);
				window.localStorage.setItem("visket_downloaded_files", JSON.stringify(arr));
			} catch (e) {
				console.error("Не удалось сохранить состояние скачанных файлов", e);
			}
		};
		const isFileDownloaded = (message) => {
			if (!message.file_name) return false;
			return downloadedFiles.value.has(message.file_name);
		};
		const downloadFile = (message) => {
			if (!message.file_url) return;
			const link = document.createElement("a");
			link.href = message.file_url;
			link.download = message.file_name || "";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			if (message.file_name) {
				downloadedFiles.value.add(message.file_name);
				persistDownloaded();
			}
		};
		const sendMessage = () => {
			if (!props.activeChat || !canSend.value) return;
			const url = editingMessage.value ? `/chats/${props.activeChat.id}/messages/${editingMessage.value.id}` : `/chats/${props.activeChat.id}/messages`;
			const wasEditing = !!editingMessage.value;
			form[wasEditing ? "put" : "post"](url, {
				preserveScroll: true,
				onSuccess: () => {
					resetForm();
					if (!wasEditing) scrollToBottom(true);
				},
				onError: (errors) => {
					console.error("Ошибка при отправке сообщения:", errors);
				}
			});
		};
		const formatSize = (bytes) => {
			if (!bytes) return "";
			const kb = bytes / 1024;
			if (kb < 1024) return kb.toFixed(1) + " КБ";
			return (kb / 1024).toFixed(2) + " МБ";
		};
		const showContextMenu = (event, message) => {
			contextMenu.value = {
				show: true,
				x: event.clientX,
				y: event.clientY,
				message
			};
			rightClickedMessage.value = message;
		};
		const hideContextMenu = () => {
			contextMenu.value.show = false;
			rightClickedMessage.value = null;
		};
		const deleteMessage = (message) => {
			if (confirm("Вы уверены, что хотите удалить это сообщение?")) router.delete(`/chats/${props.activeChat.id}/messages/${message.id}`, {
				preserveScroll: true,
				onSuccess: () => {
					hideContextMenu();
				}
			});
			else hideContextMenu();
		};
		const editMessage = (message) => {
			editingMessage.value = message;
			form.content = message.content || "";
			photoPreviewUrl.value = message.image_url || null;
			videoPreviewUrl.value = message.video_url || null;
			documentPreviewName.value = message.file_url ? message.file_name : null;
			hideContextMenu();
			nextTick(() => {
				if (textareaRef.value) {
					textareaRef.value.focus();
					autoResize();
				}
			});
		};
		const cancelEdit = () => {
			resetForm();
		};
		const toggleMessageSelection = (message) => {
			const index = selectedMessages.value.findIndex((m) => m.id === message.id);
			if (index > -1) selectedMessages.value.splice(index, 1);
			else selectedMessages.value.push(message);
		};
		const replyToMessage = (message) => {
			form.content = message.content ? `>> ${message.user.name}: ${message.content.slice(0, 50)}${message.content.length > 50 ? "…" : ""}\n` : `>> ${message.user.name}\n`;
			hideContextMenu();
			nextTick(() => {
				if (textareaRef.value) {
					textareaRef.value.focus();
					autoResize();
				}
			});
		};
		const clearSelection = () => {
			selectedMessages.value = [];
		};
		const deleteSelectedMessages = async () => {
			if (selectedMessages.value.length === 0) return;
			const messagesToDelete = selectedMessages.value.filter((m) => m.is_mine);
			if (messagesToDelete.length === 0) return;
			const messageIds = messagesToDelete.map((m) => m.id);
			const confirmMsg = messageIds.length === selectedMessages.value.length ? `Удалить ${messageIds.length} сообщение(й)?` : `Удалить ${messageIds.length} из ${selectedMessages.value.length} выбранных сообщений?`;
			if (confirm(confirmMsg)) {
				for (const id of messageIds) await new Promise((resolve) => {
					router.delete(`/chats/${props.activeChat.id}/messages/${id}`, {
						preserveScroll: true,
						onFinish: resolve
					});
				});
				selectedMessages.value = [];
				hideContextMenu();
			}
		};
		const toggleOptionsMenu = () => {
			optionsMenu.value.show = !optionsMenu.value.show;
		};
		const hideOptionsMenu = () => {
			optionsMenu.value.show = false;
		};
		const handleChatFiles = () => {
			console.log("Файлы чата");
			hideOptionsMenu();
		};
		const handleAddParticipant = () => {
			console.log("Добавить участника");
			hideOptionsMenu();
		};
		const handleSearchChat = () => {
			console.log("Поиск по чату");
			hideOptionsMenu();
		};
		const handleDeleteChat = () => {
			if (confirm("Вы уверены, что хотите удалить этот чат?")) console.log("Удалить чат");
			hideOptionsMenu();
		};
		const handleBackClick = () => {
			if (!isMobile()) {
				router.get("/chats");
				return;
			}
			isSliding.value = true;
			const el = chatArea.value;
			if (!el) {
				router.get("/chats");
				return;
			}
			const onTransitionEnd = () => {
				el.removeEventListener("transitionend", onTransitionEnd);
				router.get("/chats", {}, { preserveScroll: true });
			};
			el.addEventListener("transitionend", onTransitionEnd);
		};
		const toggleApplicationBlock = () => {
			isApplicationBlockClosed.value = !isApplicationBlockClosed.value;
			try {
				localStorage.setItem("visket_application_block_closed", isApplicationBlockClosed.value ? "1" : "0");
			} catch (e) {
				console.error("Не удалось сохранить состояние", e);
			}
			nextTick(() => {
				scrollToBottom(true);
			});
		};
		const onTouchStart = (e) => {
			if (!isMobile()) return;
			touchStartX.value = e.touches[0].clientX;
			touchCurrentX.value = e.touches[0].clientX;
			isSwiping.value = touchStartX.value < 50;
			slideOffset.value = 0;
		};
		const onTouchMove = (e) => {
			if (!isMobile() || !isSwiping.value) return;
			touchCurrentX.value = e.touches[0].clientX;
			const deltaX = touchCurrentX.value - touchStartX.value;
			if (deltaX > 0) slideOffset.value = deltaX;
		};
		const onTouchEnd = () => {
			if (!isMobile() || !isSwiping.value) return;
			if (touchCurrentX.value - touchStartX.value > 100) {
				isSliding.value = true;
				slideOffset.value = 0;
				setTimeout(() => {
					router.visit("/chats");
				}, 300);
			} else slideOffset.value = 0;
			isSwiping.value = false;
		};
		const syncBodyClass = (hasActiveChat) => {
			if (hasActiveChat) document.body.classList.add("mobile-chat-open");
			else document.body.classList.remove("mobile-chat-open");
		};
		const resizeObserver = new ResizeObserver(() => {
			if (props.activeChat && !isHydratingChat.value) scrollToBottom(true);
		});
		onMounted(async () => {
			try {
				const raw = window.localStorage.getItem("visket_downloaded_files");
				if (raw) {
					const arr = JSON.parse(raw);
					downloadedFiles.value = new Set(Array.isArray(arr) ? arr : []);
				}
			} catch (e) {
				console.error("Не удалось прочитать состояние скачанных файлов", e);
			}
			try {
				if (localStorage.getItem("visket_application_block_closed") === "1") isApplicationBlockClosed.value = true;
			} catch (e) {
				console.error("Не удалось прочитать состояние блока", e);
			}
			document.addEventListener("click", hideContextMenu);
			document.addEventListener("click", hideOptionsMenu);
			syncBodyClass(!!props.activeChat);
			hydrateChat(props.activeChat?.messages);
			if (messagesRef.value) resizeObserver.observe(messagesRef.value);
			if (chatArea.value) resizeObserver.observe(chatArea.value);
			const { default: Pusher } = await import("pusher-js");
			window.Pusher = Pusher;
			window.Echo = new Echo({
				broadcaster: "reverb",
				key: "mot6g4guh0q7w6ofocls",
				wsHost: "localhost",
				wsPort: 8080,
				wssPort: 8080,
				forceTLS: false,
				enabledTransports: ["ws"]
			});
			if (props.activeChat) window.Echo.private(`chat.${props.activeChat.id}`).listen(".message.sent", (e) => {
				router.reload({ only: ["activeChat"] });
			}).listen(".message.updated", (e) => {
				router.reload({ only: ["activeChat"] });
			}).listen(".message.deleted", (e) => {
				router.reload({ only: ["activeChat"] });
			});
			window.Echo.join("presence-online").here((users) => {
				console.log("Presence here:", users);
				onlineUsers.value = new Set(users.map((u) => u.id));
			}).joining((user) => {
				console.log("User joined:", user);
				onlineUsers.value.add(user.id);
			}).leaving((user) => {
				console.log("User left:", user);
				onlineUsers.value.delete(user.id);
			});
		});
		onUnmounted(() => {
			document.removeEventListener("click", hideContextMenu);
			document.removeEventListener("click", hideOptionsMenu);
			document.body.classList.remove("mobile-chat-open");
			if (props.activeChat && window.Echo) window.Echo.leave(`chat.${props.activeChat.id}`);
			if (window.Echo) window.Echo.leave("presence-online");
			if (stableCheckTimer) clearTimeout(stableCheckTimer);
			resizeObserver.disconnect();
		});
		watch(() => props.activeChat, (newVal) => {
			syncBodyClass(!!newVal);
		});
		watch(() => props.activeChat?.id, (newChatId, oldChatId) => {
			if (!window.Echo) return;
			if (oldChatId) window.Echo.leave(`chat.${oldChatId}`);
			if (newChatId) window.Echo.private(`chat.${newChatId}`).listen(".message.sent", (e) => {
				router.reload({ only: ["activeChat"] });
			}).listen(".message.updated", (e) => {
				router.reload({ only: ["activeChat"] });
			}).listen(".message.deleted", (e) => {
				router.reload({ only: ["activeChat"] });
			});
		});
		watch(() => props.activeChat?.messages?.length, (newLength, oldLength) => {
			if (newLength && newLength > (oldLength || 0) && !isHydratingChat.value) scrollToBottom(true);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Чаты" }, null, _parent, _scopeId));
						_push(`<div class="chat-container" data-v-16257a40${_scopeId}><div class="chat-list" data-v-16257a40${_scopeId}><div class="chat-list-header" data-v-16257a40${_scopeId}><h2 data-v-16257a40${_scopeId}>Чаты</h2></div><!--[-->`);
						ssrRenderList(__props.chats, (chat) => {
							_push(`<div class="${ssrRenderClass([{
								active: __props.activeChat && chat.id === __props.activeChat.id,
								"has-unread": chat.unread_count > 0
							}, "chat-item"])}" tabindex="0" data-v-16257a40${_scopeId}>`);
							if (chat.other_user) {
								_push(`<div class="chat-user-info" data-v-16257a40${_scopeId}><div class="avatar-wrapper" data-v-16257a40${_scopeId}><img${ssrRenderAttr("src", chat.other_user.avatar_url)} class="chat-avatar" data-v-16257a40${_scopeId}>`);
								if (isUserOnline(chat.other_user.id)) _push(`<span class="online-indicator" data-v-16257a40${_scopeId}></span>`);
								else _push(`<!---->`);
								_push(`</div><div data-v-16257a40${_scopeId}><h3 data-v-16257a40${_scopeId}>${ssrInterpolate(chat.other_user.name)}</h3>`);
								if (chat.latest_message) _push(`<p class="${ssrRenderClass([{ unread: chat.unread_count > 0 }, "chat-preview"])}" data-v-16257a40${_scopeId}>${ssrInterpolate(getChatPreview(chat.latest_message))}</p>`);
								else _push(`<!---->`);
								_push(`</div></div>`);
							} else _push(`<!---->`);
							_push(`<div class="chat-meta" data-v-16257a40${_scopeId}>`);
							if (chat.unread_count > 0) _push(`<span class="unread-badge" data-v-16257a40${_scopeId}>${ssrInterpolate(chat.unread_count > 99 ? "99+" : chat.unread_count)}</span>`);
							else _push(`<!---->`);
							_push(`</div></div>`);
						});
						_push(`<!--]--></div><div class="${ssrRenderClass([{
							active: !!__props.activeChat,
							sliding: isSliding.value
						}, "chat-area"])}" style="${ssrRenderStyle(slideOffset.value > 0 ? { transform: `translateX(${slideOffset.value}px)` } : {})}" data-v-16257a40${_scopeId}>`);
						if (__props.activeChat) {
							_push(`<!--[--><div class="chat-header" data-v-16257a40${_scopeId}><button type="button" class="back" data-v-16257a40${_scopeId}><img src="/images/arrow-left.svg" alt="назад" data-v-16257a40${_scopeId}></button><div class="chat-header-mid" data-v-16257a40${_scopeId}>`);
							if (otherUsers.value.length > 0) _push(ssrRenderComponent(unref(Link), {
								href: `/profile/${otherUsers.value[0].id}`,
								class: "chat-header-user"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) {
										_push(`<div class="avatar-wrapper" data-v-16257a40${_scopeId}><img${ssrRenderAttr("src", otherUsers.value[0].avatar_url)} class="chat-avatar" data-v-16257a40${_scopeId}>`);
										if (isUserOnline(otherUsers.value[0].id)) _push(`<span class="online-indicator" data-v-16257a40${_scopeId}></span>`);
										else _push(`<span class="offline-indicator" data-v-16257a40${_scopeId}></span>`);
										_push(`</div><h2 data-v-16257a40${_scopeId}>${ssrInterpolate(otherUsers.value[0].name)}</h2>`);
									} else return [createVNode("div", { class: "avatar-wrapper" }, [createVNode("img", {
										src: otherUsers.value[0].avatar_url,
										class: "chat-avatar"
									}, null, 8, ["src"]), isUserOnline(otherUsers.value[0].id) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "online-indicator"
									})) : (openBlock(), createBlock("span", {
										key: 1,
										class: "offline-indicator"
									}))]), createVNode("h2", null, toDisplayString(otherUsers.value[0].name), 1)];
								}),
								_: 1
							}, _parent, _scopeId));
							else _push(`<!---->`);
							if (vacancyPostId.value) _push(`<span class="vacancy-link" data-v-16257a40${_scopeId}> откликнулся на </span>`);
							else _push(`<!---->`);
							_push(ssrRenderComponent(unref(Link), { href: `/posts/${vacancyPostId.value}` }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<h2 data-v-16257a40${_scopeId}>${ssrInterpolate(vacancyPosition.value)}</h2>`);
									else return [createVNode("h2", null, toDisplayString(vacancyPosition.value), 1)];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div><img class="chat-options" src="/images/dots.svg" alt="опции" data-v-16257a40${_scopeId}></div>`);
							if (optionsMenu.value.show) _push(`<div class="options-menu" style="${ssrRenderStyle({
								right: optionsMenu.value.x + "px",
								top: optionsMenu.value.y + "px"
							})}" data-v-16257a40${_scopeId}><div class="options-menu-item" data-v-16257a40${_scopeId}>Файлы чата</div><div class="options-menu-item" data-v-16257a40${_scopeId}>Добавить участника в чат</div><div class="options-menu-item" data-v-16257a40${_scopeId}>Поиск по чату</div><div class="options-menu-item delete" data-v-16257a40${_scopeId}>Удалить чат</div></div>`);
							else _push(`<!---->`);
							if (showApplicationBlock.value) {
								_push(`<div class="${ssrRenderClass([{ closed: isApplicationBlockClosed.value }, "application-block"])}" data-v-16257a40${_scopeId}><div class="application-toggle" data-v-16257a40${_scopeId}><button type="button" class="application-toggle-btn" data-v-16257a40${_scopeId}><img src="/images/arrow-up.svg" alt="Toggle" class="${ssrRenderClass([{ flipped: isApplicationBlockClosed.value }, "toggle-arrow"])}" data-v-16257a40${_scopeId}></button></div><div class="application-card" style="${ssrRenderStyle(!isApplicationBlockClosed.value ? null : { display: "none" })}" data-v-16257a40${_scopeId}><img${ssrRenderAttr("src", __props.activeChat.application.user.avatar_url)} class="application-avatar" data-v-16257a40${_scopeId}><div class="name" data-v-16257a40${_scopeId}><h3 data-v-16257a40${_scopeId}>${ssrInterpolate(__props.activeChat.application.user.name)}</h3><span class="${ssrRenderClass([{ online: isUserOnline(otherUsers.value[0].id) }, "user-status"])}" data-v-16257a40${_scopeId}>${ssrInterpolate(isUserOnline(otherUsers.value[0].id) ? "онлайн" : "оффлайн")}</span></div><p class="account-age" data-v-16257a40${_scopeId}>Аккаунт создан ${ssrInterpolate(formatAccountAge(__props.activeChat.application.user.created_at))}</p>`);
								if (__props.activeChat.application.user.rating) _push(`<div class="application-rating" data-v-16257a40${_scopeId}><span data-v-16257a40${_scopeId}>Рейтинг: ${ssrInterpolate(__props.activeChat.application.user.rating)}</span></div>`);
								else _push(`<!---->`);
								_push(`<div class="application-cover-letter" data-v-16257a40${_scopeId}><h4 data-v-16257a40${_scopeId}>Сопроводительное письмо:</h4><p data-v-16257a40${_scopeId}>${ssrInterpolate(__props.activeChat.application.cover_letter)}</p></div>`);
								if (__props.activeChat.application.proposed_price) _push(`<div class="application-price" data-v-16257a40${_scopeId}><span class="label" data-v-16257a40${_scopeId}>Предложенная цена:</span><span class="value" data-v-16257a40${_scopeId}>${ssrInterpolate(__props.activeChat.application.proposed_price)} ₽</span></div>`);
								else _push(`<!---->`);
								if (isVacancyAuthor.value) _push(`<div class="application-actions" data-v-16257a40${_scopeId}><form data-v-16257a40${_scopeId}><button type="submit" class="accept-btn" data-v-16257a40${_scopeId}>Принять отклик</button></form><form data-v-16257a40${_scopeId}><button type="submit" class="reject-btn" data-v-16257a40${_scopeId}>Отклонить</button></form></div>`);
								else _push(`<!---->`);
								_push(`</div></div>`);
							} else _push(`<!---->`);
							_push(`<div class="chat-messages" data-v-16257a40${_scopeId}><div class="chat-messages-inner" data-v-16257a40${_scopeId}><div class="chat-messages-content" data-v-16257a40${_scopeId}><!--[-->`);
							ssrRenderList(__props.activeChat.messages, (message) => {
								_push(`<div class="${ssrRenderClass([{
									"right-clicked": rightClickedMessage.value && rightClickedMessage.value.id === message.id,
									"selected": selectedMessages.value.some((m) => m.id === message.id)
								}, "message-container"])}" data-v-16257a40${_scopeId}><img${ssrRenderAttr("src", message.user.avatar_url)} class="chat-avatar" data-v-16257a40${_scopeId}><div class="${ssrRenderClass([{
									"my-message": message.is_mine,
									"shared-post": isOnlyPostUrl(message.content)
								}, "message"])}" data-v-16257a40${_scopeId}>`);
								if (message.image_url) _push(`<img${ssrRenderAttr("src", message.image_url)} alt="Изображение" class="message-image" data-v-16257a40${_scopeId}>`);
								else _push(`<!---->`);
								if (message.video_url) _push(`<video${ssrRenderAttr("src", message.video_url)} class="message-video" controls data-v-16257a40${_scopeId}></video>`);
								else _push(`<!---->`);
								_push(`<div class="message-content" data-v-16257a40${_scopeId}>`);
								if (message.content && !isOnlyPostUrl(message.content)) _push(`<span data-v-16257a40${_scopeId}>${renderContent(message.content) ?? ""}</span>`);
								else _push(`<!---->`);
								_push(`<!--[-->`);
								ssrRenderList(getPostPreviewsFromContent(message.content), (preview) => {
									_push(`<div class="${ssrRenderClass([{ "shared-post-card": isOnlyPostUrl(message.content) }, "post-preview-card"])}" data-v-16257a40${_scopeId}>`);
									if (preview.image_url) _push(`<img${ssrRenderAttr("src", preview.image_url)} class="post-preview-img" alt="" data-v-16257a40${_scopeId}>`);
									else _push(`<!---->`);
									_push(`<div class="post-preview-body" data-v-16257a40${_scopeId}><div class="post-preview-title" data-v-16257a40${_scopeId}>${ssrInterpolate(preview.title)}</div>`);
									if (preview.description) _push(`<div class="post-preview-desc" data-v-16257a40${_scopeId}>${ssrInterpolate(preview.description.slice(0, 80))}${ssrInterpolate(preview.description.length > 80 ? "…" : "")}</div>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								});
								_push(`<!--]-->`);
								if (message.file_url) {
									_push(`<div class="file-attachment" data-v-16257a40${_scopeId}><button type="button" class="file-download-circle"${ssrRenderAttr("title", isFileDownloaded(message) ? "Скачано" : "Скачать")} data-v-16257a40${_scopeId}>`);
									if (!isFileDownloaded(message)) _push(`<span data-v-16257a40${_scopeId}><img src="/images/download.svg" alt="Скачать" data-v-16257a40${_scopeId}></span>`);
									else _push(`<span data-v-16257a40${_scopeId}><img src="/images/document.svg" alt="Файл" data-v-16257a40${_scopeId}></span>`);
									_push(`</button><div class="file-meta" data-v-16257a40${_scopeId}><div class="file-name" data-v-16257a40${_scopeId}>${ssrInterpolate(message.file_name || "Файл")}</div>`);
									if (message.file_size) _push(`<div class="file-size" data-v-16257a40${_scopeId}>${ssrInterpolate(formatSize(message.file_size))}</div>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="message-time" data-v-16257a40${_scopeId}>${ssrInterpolate(message.time)}</div></div></div>`);
							});
							_push(`<!--]--></div>`);
							if (showSkeleton.value) {
								_push(`<div class="${ssrRenderClass([{ fading: isSkeletonFading.value }, "chat-skeleton"])}" data-v-16257a40${_scopeId}><!--[-->`);
								ssrRenderList(skeletonItems.value, (item, index) => {
									_push(`<div class="${ssrRenderClass([{ right: item.side === "right" }, "skeleton-message"])}" data-v-16257a40${_scopeId}><div class="skeleton-avatar" data-v-16257a40${_scopeId}></div><div class="skeleton-bubble" data-v-16257a40${_scopeId}><div class="skeleton-line" style="${ssrRenderStyle({ width: item.lines[0] })}" data-v-16257a40${_scopeId}></div><div class="skeleton-line short" style="${ssrRenderStyle({ width: item.lines[1] })}" data-v-16257a40${_scopeId}></div>`);
									if (item.hasThirdLine) _push(`<div class="skeleton-line tiny" style="${ssrRenderStyle({ width: item.lines[2] })}" data-v-16257a40${_scopeId}></div>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<!---->`);
							_push(`</div></div><form class="message-form" enctype="multipart/form-data" data-v-16257a40${_scopeId}>`);
							if (editingMessage.value) _push(`<div class="editing-indicator" data-v-16257a40${_scopeId}><span data-v-16257a40${_scopeId}>Редактирование сообщения</span><button type="button" class="cancel-edit-btn" data-v-16257a40${_scopeId}>✕</button></div>`);
							else _push(`<!---->`);
							_push(`<div class="message-input-container" data-v-16257a40${_scopeId}>`);
							if (!editingMessage.value) _push(`<div class="add" data-v-16257a40${_scopeId}><img src="/images/clip.svg" alt="Добавить вложение" data-v-16257a40${_scopeId}><div class="add-select" data-v-16257a40${_scopeId}><label data-v-16257a40${_scopeId}> Фото <input type="file" name="photo" accept="image/*" data-v-16257a40${_scopeId}></label><label data-v-16257a40${_scopeId}> Видео <input type="file" name="video" accept="video/*" data-v-16257a40${_scopeId}></label><label data-v-16257a40${_scopeId}> Документ <input type="file" name="document" data-v-16257a40${_scopeId}></label></div></div>`);
							else _push(`<!---->`);
							_push(`<textarea${ssrRenderAttr("placeholder", editingMessage.value ? "Редактируйте сообщение..." : "Введите сообщение...")} data-v-16257a40${_scopeId}>${ssrInterpolate(unref(form).content)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(form).processing || !canSend.value) ? " disabled" : ""} data-v-16257a40${_scopeId}>${ssrInterpolate(editingMessage.value ? "Сохранить" : "Отправить")}</button></div>`);
							if (photoPreviewUrl.value || videoPreviewUrl.value || documentPreviewName.value) {
								_push(`<div class="image-preview-container" style="${ssrRenderStyle({ "display": "flex" })}" data-v-16257a40${_scopeId}>`);
								if (photoPreviewUrl.value) _push(`<img${ssrRenderAttr("src", photoPreviewUrl.value)} alt="Превью" class="image-preview" data-v-16257a40${_scopeId}>`);
								else _push(`<!---->`);
								if (videoPreviewUrl.value) _push(`<video${ssrRenderAttr("src", videoPreviewUrl.value)} class="video-preview" controls data-v-16257a40${_scopeId}></video>`);
								else _push(`<!---->`);
								if (documentPreviewName.value) _push(`<div class="file-preview" data-v-16257a40${_scopeId}> 📎 ${ssrInterpolate(documentPreviewName.value)}</div>`);
								else _push(`<!---->`);
								_push(`<div class="preview-actions" data-v-16257a40${_scopeId}><button type="button" class="select-other-btn" data-v-16257a40${_scopeId}> Выбрать другое </button>`);
								if (!editingMessage.value) _push(`<button type="button" class="cancel-preview-btn" data-v-16257a40${_scopeId}> Отмена </button>`);
								else _push(`<!---->`);
								_push(`</div></div>`);
							} else _push(`<!---->`);
							_push(`</form><!--]-->`);
						} else _push(`<div class="chat-placeholder" data-v-16257a40${_scopeId}><p data-v-16257a40${_scopeId}>Выберите чат для начала общения</p></div>`);
						_push(`</div></div>`);
						if (modalOpen.value && modalImage.value) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-16257a40${_scopeId}><div class="modal-content" data-v-16257a40${_scopeId}><button class="modal-close" type="button" data-v-16257a40${_scopeId}> × </button><img${ssrRenderAttr("src", modalImage.value)} alt="Предпросмотр" data-v-16257a40${_scopeId}></div></div>`);
						else _push(`<!---->`);
						if (modalOpen.value && modalVideo.value) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-16257a40${_scopeId}><div class="modal-content modal-video-content" data-v-16257a40${_scopeId}><button class="modal-close" type="button" data-v-16257a40${_scopeId}> × </button><video${ssrRenderAttr("src", modalVideo.value)} controls autoplay class="modal-video" data-v-16257a40${_scopeId}></video></div></div>`);
						else _push(`<!---->`);
						if (contextMenu.value.show) {
							_push(`<div class="context-menu" style="${ssrRenderStyle({
								left: contextMenu.value.x + "px",
								top: contextMenu.value.y + "px"
							})}" data-v-16257a40${_scopeId}>`);
							if (!contextMenu.value.message?.is_mine) _push(`<div class="context-menu-item" data-v-16257a40${_scopeId}> Ответить </div>`);
							else _push(`<!---->`);
							if (contextMenu.value.message?.is_mine) _push(`<div class="context-menu-item" data-v-16257a40${_scopeId}> Редактировать </div>`);
							else _push(`<!---->`);
							if (contextMenu.value.message?.is_mine) _push(`<div class="context-menu-item delete" data-v-16257a40${_scopeId}> Удалить </div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						if (selectedMessages.value.length > 0) {
							_push(`<div class="selection-toolbar" data-v-16257a40${_scopeId}><span data-v-16257a40${_scopeId}>${ssrInterpolate(selectedMessages.value.length)} выбрано</span>`);
							if (canDeleteSelected.value) _push(`<button type="button" class="selection-delete-btn" data-v-16257a40${_scopeId}> Удалить </button>`);
							else _push(`<!---->`);
							_push(`<button type="button" class="selection-clear-btn" data-v-16257a40${_scopeId}> Отмена </button></div>`);
						} else _push(`<!---->`);
					} else return [
						createVNode(unref(Head), { title: "Чаты" }),
						createVNode("div", { class: "chat-container" }, [createVNode("div", { class: "chat-list" }, [createVNode("div", { class: "chat-list-header" }, [createVNode("h2", null, "Чаты")]), (openBlock(true), createBlock(Fragment, null, renderList(__props.chats, (chat) => {
							return openBlock(), createBlock("div", {
								key: chat.id,
								onClick: ($event) => unref(router).visit(`/chats/${chat.id}`),
								class: ["chat-item", {
									active: __props.activeChat && chat.id === __props.activeChat.id,
									"has-unread": chat.unread_count > 0
								}],
								tabindex: "0",
								onKeydown: withKeys(($event) => unref(router).visit(`/chats/${chat.id}`), ["enter"])
							}, [chat.other_user ? (openBlock(), createBlock("div", {
								key: 0,
								class: "chat-user-info"
							}, [createVNode("div", { class: "avatar-wrapper" }, [createVNode("img", {
								src: chat.other_user.avatar_url,
								class: "chat-avatar"
							}, null, 8, ["src"]), isUserOnline(chat.other_user.id) ? (openBlock(), createBlock("span", {
								key: 0,
								class: "online-indicator"
							})) : createCommentVNode("", true)]), createVNode("div", null, [createVNode("h3", null, toDisplayString(chat.other_user.name), 1), chat.latest_message ? (openBlock(), createBlock("p", {
								key: 0,
								class: ["chat-preview", { unread: chat.unread_count > 0 }]
							}, toDisplayString(getChatPreview(chat.latest_message)), 3)) : createCommentVNode("", true)])])) : createCommentVNode("", true), createVNode("div", { class: "chat-meta" }, [chat.unread_count > 0 ? (openBlock(), createBlock("span", {
								key: 0,
								class: "unread-badge"
							}, toDisplayString(chat.unread_count > 99 ? "99+" : chat.unread_count), 1)) : createCommentVNode("", true)])], 42, ["onClick", "onKeydown"]);
						}), 128))]), createVNode("div", {
							class: ["chat-area", {
								active: !!__props.activeChat,
								sliding: isSliding.value
							}],
							style: slideOffset.value > 0 ? { transform: `translateX(${slideOffset.value}px)` } : {},
							ref_key: "chatArea",
							ref: chatArea,
							onTouchstart: onTouchStart,
							onTouchmove: onTouchMove,
							onTouchend: onTouchEnd
						}, [__props.activeChat ? (openBlock(), createBlock(Fragment, { key: 0 }, [
							createVNode("div", { class: "chat-header" }, [
								createVNode("button", {
									type: "button",
									class: "back",
									onClick: handleBackClick
								}, [createVNode("img", {
									src: "/images/arrow-left.svg",
									alt: "назад"
								})]),
								createVNode("div", { class: "chat-header-mid" }, [
									otherUsers.value.length > 0 ? (openBlock(), createBlock(unref(Link), {
										key: 0,
										href: `/profile/${otherUsers.value[0].id}`,
										class: "chat-header-user"
									}, {
										default: withCtx(() => [createVNode("div", { class: "avatar-wrapper" }, [createVNode("img", {
											src: otherUsers.value[0].avatar_url,
											class: "chat-avatar"
										}, null, 8, ["src"]), isUserOnline(otherUsers.value[0].id) ? (openBlock(), createBlock("span", {
											key: 0,
											class: "online-indicator"
										})) : (openBlock(), createBlock("span", {
											key: 1,
											class: "offline-indicator"
										}))]), createVNode("h2", null, toDisplayString(otherUsers.value[0].name), 1)]),
										_: 1
									}, 8, ["href"])) : createCommentVNode("", true),
									vacancyPostId.value ? (openBlock(), createBlock("span", {
										key: 1,
										class: "vacancy-link"
									}, " откликнулся на ")) : createCommentVNode("", true),
									createVNode(unref(Link), { href: `/posts/${vacancyPostId.value}` }, {
										default: withCtx(() => [createVNode("h2", null, toDisplayString(vacancyPosition.value), 1)]),
										_: 1
									}, 8, ["href"])
								]),
								createVNode("img", {
									class: "chat-options",
									src: "/images/dots.svg",
									alt: "опции",
									onClick: withModifiers(toggleOptionsMenu, ["stop"])
								})
							]),
							optionsMenu.value.show ? (openBlock(), createBlock("div", {
								key: 0,
								class: "options-menu",
								style: {
									right: optionsMenu.value.x + "px",
									top: optionsMenu.value.y + "px"
								}
							}, [
								createVNode("div", {
									class: "options-menu-item",
									onClick: handleChatFiles
								}, "Файлы чата"),
								createVNode("div", {
									class: "options-menu-item",
									onClick: handleAddParticipant
								}, "Добавить участника в чат"),
								createVNode("div", {
									class: "options-menu-item",
									onClick: handleSearchChat
								}, "Поиск по чату"),
								createVNode("div", {
									class: "options-menu-item delete",
									onClick: handleDeleteChat
								}, "Удалить чат")
							], 4)) : createCommentVNode("", true),
							showApplicationBlock.value ? (openBlock(), createBlock("div", {
								key: 1,
								class: ["application-block", { closed: isApplicationBlockClosed.value }]
							}, [createVNode("div", { class: "application-toggle" }, [createVNode("button", {
								type: "button",
								class: "application-toggle-btn",
								onClick: toggleApplicationBlock
							}, [createVNode("img", {
								src: "/images/arrow-up.svg",
								alt: "Toggle",
								class: ["toggle-arrow", { flipped: isApplicationBlockClosed.value }]
							}, null, 2)])]), withDirectives(createVNode("div", { class: "application-card" }, [
								createVNode("img", {
									src: __props.activeChat.application.user.avatar_url,
									class: "application-avatar"
								}, null, 8, ["src"]),
								createVNode("div", { class: "name" }, [createVNode("h3", null, toDisplayString(__props.activeChat.application.user.name), 1), createVNode("span", { class: ["user-status", { online: isUserOnline(otherUsers.value[0].id) }] }, toDisplayString(isUserOnline(otherUsers.value[0].id) ? "онлайн" : "оффлайн"), 3)]),
								createVNode("p", { class: "account-age" }, "Аккаунт создан " + toDisplayString(formatAccountAge(__props.activeChat.application.user.created_at)), 1),
								__props.activeChat.application.user.rating ? (openBlock(), createBlock("div", {
									key: 0,
									class: "application-rating"
								}, [createVNode("span", null, "Рейтинг: " + toDisplayString(__props.activeChat.application.user.rating), 1)])) : createCommentVNode("", true),
								createVNode("div", { class: "application-cover-letter" }, [createVNode("h4", null, "Сопроводительное письмо:"), createVNode("p", null, toDisplayString(__props.activeChat.application.cover_letter), 1)]),
								__props.activeChat.application.proposed_price ? (openBlock(), createBlock("div", {
									key: 1,
									class: "application-price"
								}, [createVNode("span", { class: "label" }, "Предложенная цена:"), createVNode("span", { class: "value" }, toDisplayString(__props.activeChat.application.proposed_price) + " ₽", 1)])) : createCommentVNode("", true),
								isVacancyAuthor.value ? (openBlock(), createBlock("div", {
									key: 2,
									class: "application-actions"
								}, [createVNode("form", { onSubmit: withModifiers(acceptApplication, ["prevent"]) }, [createVNode("button", {
									type: "submit",
									class: "accept-btn"
								}, "Принять отклик")], 32), createVNode("form", { onSubmit: withModifiers(rejectApplication, ["prevent"]) }, [createVNode("button", {
									type: "submit",
									class: "reject-btn"
								}, "Отклонить")], 32)])) : createCommentVNode("", true)
							], 512), [[vShow, !isApplicationBlockClosed.value]])], 2)) : createCommentVNode("", true),
							createVNode("div", {
								class: "chat-messages",
								ref_key: "messagesRef",
								ref: messagesRef
							}, [createVNode("div", { class: "chat-messages-inner" }, [createVNode("div", { class: "chat-messages-content" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.activeChat.messages, (message) => {
								return openBlock(), createBlock("div", {
									key: message.id,
									class: ["message-container", {
										"right-clicked": rightClickedMessage.value && rightClickedMessage.value.id === message.id,
										"selected": selectedMessages.value.some((m) => m.id === message.id)
									}],
									onClick: ($event) => toggleMessageSelection(message),
									onContextmenu: withModifiers(($event) => showContextMenu($event, message), ["prevent"])
								}, [createVNode("img", {
									src: message.user.avatar_url,
									class: "chat-avatar"
								}, null, 8, ["src"]), createVNode("div", { class: ["message", {
									"my-message": message.is_mine,
									"shared-post": isOnlyPostUrl(message.content)
								}] }, [
									message.image_url ? (openBlock(), createBlock("img", {
										key: 0,
										src: message.image_url,
										alt: "Изображение",
										class: "message-image",
										onClick: ($event) => openImage(message.image_url)
									}, null, 8, ["src", "onClick"])) : createCommentVNode("", true),
									message.video_url ? (openBlock(), createBlock("video", {
										key: 1,
										src: message.video_url,
										class: "message-video",
										controls: "",
										onClick: withModifiers(($event) => openVideo(message.video_url), ["stop"])
									}, null, 8, ["src", "onClick"])) : createCommentVNode("", true),
									createVNode("div", { class: "message-content" }, [
										message.content && !isOnlyPostUrl(message.content) ? (openBlock(), createBlock("span", {
											key: 0,
											innerHTML: renderContent(message.content)
										}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
										(openBlock(true), createBlock(Fragment, null, renderList(getPostPreviewsFromContent(message.content), (preview) => {
											return openBlock(), createBlock("div", {
												key: preview.id,
												class: ["post-preview-card", { "shared-post-card": isOnlyPostUrl(message.content) }],
												onClick: withModifiers(($event) => unref(router).visit(`/posts/${preview.id}`), ["stop"])
											}, [preview.image_url ? (openBlock(), createBlock("img", {
												key: 0,
												src: preview.image_url,
												class: "post-preview-img",
												alt: ""
											}, null, 8, ["src"])) : createCommentVNode("", true), createVNode("div", { class: "post-preview-body" }, [createVNode("div", { class: "post-preview-title" }, toDisplayString(preview.title), 1), preview.description ? (openBlock(), createBlock("div", {
												key: 0,
												class: "post-preview-desc"
											}, toDisplayString(preview.description.slice(0, 80)) + toDisplayString(preview.description.length > 80 ? "…" : ""), 1)) : createCommentVNode("", true)])], 10, ["onClick"]);
										}), 128)),
										message.file_url ? (openBlock(), createBlock("div", {
											key: 1,
											class: "file-attachment"
										}, [createVNode("button", {
											type: "button",
											class: "file-download-circle",
											title: isFileDownloaded(message) ? "Скачано" : "Скачать",
											onClick: ($event) => downloadFile(message)
										}, [!isFileDownloaded(message) ? (openBlock(), createBlock("span", { key: 0 }, [createVNode("img", {
											src: "/images/download.svg",
											alt: "Скачать"
										})])) : (openBlock(), createBlock("span", { key: 1 }, [createVNode("img", {
											src: "/images/document.svg",
											alt: "Файл"
										})]))], 8, ["title", "onClick"]), createVNode("div", { class: "file-meta" }, [createVNode("div", { class: "file-name" }, toDisplayString(message.file_name || "Файл"), 1), message.file_size ? (openBlock(), createBlock("div", {
											key: 0,
											class: "file-size"
										}, toDisplayString(formatSize(message.file_size)), 1)) : createCommentVNode("", true)])])) : createCommentVNode("", true)
									]),
									createVNode("div", { class: "message-time" }, toDisplayString(message.time), 1)
								], 2)], 42, ["onClick", "onContextmenu"]);
							}), 128))]), showSkeleton.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: ["chat-skeleton", { fading: isSkeletonFading.value }]
							}, [(openBlock(true), createBlock(Fragment, null, renderList(skeletonItems.value, (item, index) => {
								return openBlock(), createBlock("div", {
									key: index,
									class: ["skeleton-message", { right: item.side === "right" }]
								}, [createVNode("div", { class: "skeleton-avatar" }), createVNode("div", { class: "skeleton-bubble" }, [
									createVNode("div", {
										class: "skeleton-line",
										style: { width: item.lines[0] }
									}, null, 4),
									createVNode("div", {
										class: "skeleton-line short",
										style: { width: item.lines[1] }
									}, null, 4),
									item.hasThirdLine ? (openBlock(), createBlock("div", {
										key: 0,
										class: "skeleton-line tiny",
										style: { width: item.lines[2] }
									}, null, 4)) : createCommentVNode("", true)
								])], 2);
							}), 128))], 2)) : createCommentVNode("", true)])], 512),
							createVNode("form", {
								class: "message-form",
								onSubmit: withModifiers(sendMessage, ["prevent"]),
								enctype: "multipart/form-data"
							}, [
								editingMessage.value ? (openBlock(), createBlock("div", {
									key: 0,
									class: "editing-indicator"
								}, [createVNode("span", null, "Редактирование сообщения"), createVNode("button", {
									type: "button",
									class: "cancel-edit-btn",
									onClick: cancelEdit
								}, "✕")])) : createCommentVNode("", true),
								createVNode("div", { class: "message-input-container" }, [
									!editingMessage.value ? (openBlock(), createBlock("div", {
										key: 0,
										class: "add"
									}, [createVNode("img", {
										src: "/images/clip.svg",
										alt: "Добавить вложение"
									}), createVNode("div", { class: "add-select" }, [
										createVNode("label", null, [createTextVNode(" Фото "), createVNode("input", {
											type: "file",
											name: "photo",
											accept: "image/*",
											onChange: _ctx.onPhotoChange
										}, null, 40, ["onChange"])]),
										createVNode("label", null, [createTextVNode(" Видео "), createVNode("input", {
											type: "file",
											name: "video",
											accept: "video/*",
											onChange: _ctx.onVideoChange
										}, null, 40, ["onChange"])]),
										createVNode("label", null, [createTextVNode(" Документ "), createVNode("input", {
											type: "file",
											name: "document",
											onChange: _ctx.onDocumentChange
										}, null, 40, ["onChange"])])
									])])) : createCommentVNode("", true),
									withDirectives(createVNode("textarea", {
										ref_key: "textareaRef",
										ref: textareaRef,
										"onUpdate:modelValue": ($event) => unref(form).content = $event,
										placeholder: editingMessage.value ? "Редактируйте сообщение..." : "Введите сообщение...",
										onInput: autoResize,
										onKeydown: withKeys(withModifiers(sendMessage, ["exact", "prevent"]), ["enter"])
									}, null, 40, [
										"onUpdate:modelValue",
										"placeholder",
										"onKeydown"
									]), [[vModelText, unref(form).content]]),
									createVNode("button", {
										type: "submit",
										disabled: unref(form).processing || !canSend.value
									}, toDisplayString(editingMessage.value ? "Сохранить" : "Отправить"), 9, ["disabled"])
								]),
								photoPreviewUrl.value || videoPreviewUrl.value || documentPreviewName.value ? (openBlock(), createBlock("div", {
									key: 1,
									class: "image-preview-container",
									style: { "display": "flex" }
								}, [
									photoPreviewUrl.value ? (openBlock(), createBlock("img", {
										key: 0,
										src: photoPreviewUrl.value,
										alt: "Превью",
										class: "image-preview"
									}, null, 8, ["src"])) : createCommentVNode("", true),
									videoPreviewUrl.value ? (openBlock(), createBlock("video", {
										key: 1,
										src: videoPreviewUrl.value,
										class: "video-preview",
										controls: ""
									}, null, 8, ["src"])) : createCommentVNode("", true),
									documentPreviewName.value ? (openBlock(), createBlock("div", {
										key: 2,
										class: "file-preview"
									}, " 📎 " + toDisplayString(documentPreviewName.value), 1)) : createCommentVNode("", true),
									createVNode("div", { class: "preview-actions" }, [createVNode("button", {
										type: "button",
										class: "select-other-btn",
										onClick: selectOtherFile
									}, " Выбрать другое "), !editingMessage.value ? (openBlock(), createBlock("button", {
										key: 0,
										type: "button",
										class: "cancel-preview-btn",
										onClick: cancelPreview
									}, " Отмена ")) : createCommentVNode("", true)])
								])) : createCommentVNode("", true)
							], 32)
						], 64)) : (openBlock(), createBlock("div", {
							key: 1,
							class: "chat-placeholder"
						}, [createVNode("p", null, "Выберите чат для начала общения")]))], 38)]),
						modalOpen.value && modalImage.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "modal-overlay",
							onClick: withModifiers(closeModal, ["self"]),
							style: { "display": "flex" }
						}, [createVNode("div", { class: "modal-content" }, [createVNode("button", {
							class: "modal-close",
							type: "button",
							onClick: closeModal
						}, " × "), createVNode("img", {
							src: modalImage.value,
							alt: "Предпросмотр"
						}, null, 8, ["src"])])])) : createCommentVNode("", true),
						modalOpen.value && modalVideo.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "modal-overlay",
							onClick: withModifiers(closeModal, ["self"]),
							style: { "display": "flex" }
						}, [createVNode("div", { class: "modal-content modal-video-content" }, [createVNode("button", {
							class: "modal-close",
							type: "button",
							onClick: closeModal
						}, " × "), createVNode("video", {
							src: modalVideo.value,
							controls: "",
							autoplay: "",
							class: "modal-video"
						}, null, 8, ["src"])])])) : createCommentVNode("", true),
						contextMenu.value.show ? (openBlock(), createBlock("div", {
							key: 2,
							class: "context-menu",
							style: {
								left: contextMenu.value.x + "px",
								top: contextMenu.value.y + "px"
							}
						}, [
							!contextMenu.value.message?.is_mine ? (openBlock(), createBlock("div", {
								key: 0,
								class: "context-menu-item",
								onClick: ($event) => replyToMessage(contextMenu.value.message)
							}, " Ответить ", 8, ["onClick"])) : createCommentVNode("", true),
							contextMenu.value.message?.is_mine ? (openBlock(), createBlock("div", {
								key: 1,
								class: "context-menu-item",
								onClick: ($event) => editMessage(contextMenu.value.message)
							}, " Редактировать ", 8, ["onClick"])) : createCommentVNode("", true),
							contextMenu.value.message?.is_mine ? (openBlock(), createBlock("div", {
								key: 2,
								class: "context-menu-item delete",
								onClick: ($event) => deleteMessage(contextMenu.value.message)
							}, " Удалить ", 8, ["onClick"])) : createCommentVNode("", true)
						], 4)) : createCommentVNode("", true),
						selectedMessages.value.length > 0 ? (openBlock(), createBlock("div", {
							key: 3,
							class: "selection-toolbar"
						}, [
							createVNode("span", null, toDisplayString(selectedMessages.value.length) + " выбрано", 1),
							canDeleteSelected.value ? (openBlock(), createBlock("button", {
								key: 0,
								type: "button",
								class: "selection-delete-btn",
								onClick: deleteSelectedMessages
							}, " Удалить ")) : createCommentVNode("", true),
							createVNode("button", {
								type: "button",
								class: "selection-clear-btn",
								onClick: clearSelection
							}, " Отмена ")
						])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$13 = _sfc_main$13.setup;
_sfc_main$13.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Chat/Chats.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var Chats_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$13, [["__scopeId", "data-v-16257a40"]]);
//#endregion
//#region resources/js/Components/Post.vue
var _sfc_main$12 = {
	__name: "Post",
	__ssrInlineRender: true,
	props: { post: Object },
	setup(__props) {
		const props = __props;
		const localLikes = ref(props.post.likes_count ?? 0);
		const isLiked = ref(props.post.is_liked ?? false);
		watch(() => props.post.likes_count, (newVal) => {
			localLikes.value = newVal;
		});
		watch(() => props.post.is_liked, (newVal) => {
			isLiked.value = newVal;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "post" }, _attrs))} data-v-fb52325a>`);
			if (__props.post.is_vacancy) _push(`<div class="vacancy-badge" data-v-fb52325a>Вакансия</div>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(unref(Link), { href: __props.post.show_url }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) if (__props.post.image_url) _push(`<img${ssrRenderAttr("src", __props.post.image_url)}${ssrRenderAttr("alt", __props.post.title)} data-v-fb52325a${_scopeId}>`);
					else _push(`<!---->`);
					else return [__props.post.image_url ? (openBlock(), createBlock("img", {
						key: 0,
						src: __props.post.image_url,
						alt: __props.post.title
					}, null, 8, ["src", "alt"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="post-content" data-v-fb52325a><div data-v-fb52325a>`);
			_push(ssrRenderComponent(unref(Link), { href: __props.post.show_url }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<h3 class="title" data-v-fb52325a${_scopeId}>${ssrInterpolate(__props.post.title)}</h3>`);
					else return [createVNode("h3", { class: "title" }, toDisplayString(__props.post.title), 1)];
				}),
				_: 1
			}, _parent));
			_push(`<p class="description" data-v-fb52325a>${ssrInterpolate(__props.post.description)}</p></div><small data-v-fb52325a> Автор: `);
			_push(ssrRenderComponent(unref(Link), {
				href: __props.post.user.profile_url,
				class: "username"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(__props.post.user.name)}`);
					else return [createTextVNode(toDisplayString(__props.post.user.name), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</small><div class="post-actions" data-v-fb52325a><button type="button" class="${ssrRenderClass({ liked: isLiked.value })}" id="like" data-v-fb52325a>${ssrInterpolate(isLiked.value ? "❤️" : "🤍")} ${ssrInterpolate(localLikes.value)}</button></div></div></div>`);
		};
	}
};
var _sfc_setup$12 = _sfc_main$12.setup;
_sfc_main$12.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Post.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var Post_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$12, [["__scopeId", "data-v-fb52325a"]]);
//#endregion
//#region resources/js/Pages/Home.vue
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => Home_default });
var _sfc_main$11 = /* @__PURE__ */ Object.assign({ layout: _sfc_main$21 }, {
	__name: "Home",
	__ssrInlineRender: true,
	props: {
		posts: {
			type: Array,
			default: () => []
		},
		skills: {
			type: Array,
			default: () => []
		},
		userSkills: {
			type: Array,
			default: () => []
		},
		auth: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const props = __props;
		const posts = computed(() => props.posts || []);
		const authUser = computed(() => props.auth?.user || null);
		const heroImage = "/images/Photoroom.png";
		const query = ref("");
		const typeFilter = ref("");
		const selectedSkills = ref([]);
		const activeTab = ref("all");
		const viewMode = ref(localStorage.getItem("viewMode") || "grid");
		const filtersVisible = ref(false);
		const filtersContainer = ref(null);
		const mainWrapper = ref(null);
		const syncFiltersHeight = () => {
			if (filtersContainer.value && mainWrapper.value) filtersContainer.value.style.height = mainWrapper.value.offsetHeight + "px";
		};
		onMounted(() => {
			nextTick(() => {
				syncFiltersHeight();
				window.addEventListener("resize", syncFiltersHeight);
			});
		});
		const calculateMatchPercentage = (vacancySkills, userSkillsArr) => {
			if (!vacancySkills || vacancySkills.length === 0) return 0;
			if (!userSkillsArr || userSkillsArr.length === 0) return 0;
			const userSkillIds = userSkillsArr.map((s) => s.id);
			const matchedSkills = vacancySkills.filter((vs) => userSkillIds.includes(vs.id));
			return Math.round(matchedSkills.length / vacancySkills.length * 100);
		};
		const forYouPosts = computed(() => {
			const userSkillsArr = props.userSkills.length > 0 ? props.userSkills : selectedSkills.value;
			if (userSkillsArr.length === 0) return [];
			return posts.value.filter((post) => post.is_vacancy && post.vacancy && post.vacancy.skills).map((post) => ({
				...post,
				matchPercentage: calculateMatchPercentage(post.vacancy.skills, userSkillsArr)
			})).filter((post) => post.matchPercentage > 0).sort((a, b) => b.matchPercentage - a.matchPercentage);
		});
		const filteredPosts = computed(() => {
			let result = posts.value;
			if (query.value) {
				const q = query.value.toLowerCase();
				result = result.filter((post) => post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q));
			}
			if (typeFilter.value) if (typeFilter.value === "vacancy") result = result.filter((post) => post.is_vacancy);
			else result = result.filter((post) => !post.is_vacancy);
			if (selectedSkills.value.length > 0) {
				const skillIds = selectedSkills.value.map((s) => s.id);
				result = result.filter((post) => post.vacancy && post.vacancy.skills && post.vacancy.skills.some((s) => skillIds.includes(s.id)));
			}
			return result;
		});
		const displayedPosts = computed(() => {
			if (activeTab.value === "foryou") return forYouPosts.value;
			return filteredPosts.value;
		});
		watch(displayedPosts, () => {
			nextTick(syncFiltersHeight);
		});
		watch(viewMode, (newVal) => {
			localStorage.setItem("viewMode", newVal);
			nextTick(syncFiltersHeight);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: "Главная" }, null, _parent));
			_push(`<div class="block1" data-v-7f74233e><h1 data-v-7f74233e>Место, где работа находит работника<br data-v-7f74233e>и наоборот.</h1><img${ssrRenderAttr("src", heroImage)} alt="bruh" data-v-7f74233e></div><div class="block2" data-v-7f74233e><button class="filter-toggle" data-v-7f74233e> Фильтры <span data-v-7f74233e>${ssrInterpolate(filtersVisible.value ? "▼" : "▶")}</span></button><div class="search-container" data-v-7f74233e><input class="searchbar"${ssrRenderAttr("value", query.value)} type="text" placeholder="Поиск по постам" data-v-7f74233e><div class="view-mode-toggle" data-v-7f74233e><button class="${ssrRenderClass([{ active: viewMode.value === "grid" }, "view-mode-btn"])}" type="button" data-v-7f74233e><img src="/images/grid-view.svg" alt="Сетка" data-v-7f74233e></button><button class="${ssrRenderClass([{ active: viewMode.value === "list" }, "view-mode-btn"])}" type="button" data-v-7f74233e><img src="/images/list-view.svg" alt="Список" data-v-7f74233e></button></div></div></div><div class="${ssrRenderClass([{ filtersOpen: filtersVisible.value }, "content-wrapper"])}" data-v-7f74233e><div class="filterscontainer" data-v-7f74233e><div class="filters" data-v-7f74233e><div class="filter-group" data-v-7f74233e><label data-v-7f74233e>Тип:</label><div class="type-selector" data-v-7f74233e><button class="${ssrRenderClass({ active: typeFilter.value === "" })}" data-v-7f74233e> Все </button><button class="${ssrRenderClass({ active: typeFilter.value === "vacancy" })}" data-v-7f74233e> Вакансии </button><button class="${ssrRenderClass({ active: typeFilter.value === "post" })}" data-v-7f74233e> Посты </button></div></div><div class="filter-group" data-v-7f74233e><label data-v-7f74233e>Навыки:</label>`);
			_push(ssrRenderComponent(SkillsSelector_default, {
				modelValue: selectedSkills.value,
				"onUpdate:modelValue": ($event) => selectedSkills.value = $event,
				skills: __props.skills
			}, null, _parent));
			_push(`</div>`);
			if (selectedSkills.value.length > 0) {
				_push(`<div class="selected-skills" data-v-7f74233e><!--[-->`);
				ssrRenderList(selectedSkills.value, (skill) => {
					_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-7f74233e><span class="skill-name" data-v-7f74233e>${ssrInterpolate(skill.name)}</span><div class="skill-level" data-v-7f74233e><label data-v-7f74233e>Уровень:</label><select data-v-7f74233e><option${ssrRenderAttr("value", 1)} data-v-7f74233e${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 1) : ssrLooseEqual(skill.level, 1)) ? " selected" : ""}>1</option><option${ssrRenderAttr("value", 2)} data-v-7f74233e${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 2) : ssrLooseEqual(skill.level, 2)) ? " selected" : ""}>2</option><option${ssrRenderAttr("value", 3)} data-v-7f74233e${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 3) : ssrLooseEqual(skill.level, 3)) ? " selected" : ""}>3</option><option${ssrRenderAttr("value", 4)} data-v-7f74233e${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 4) : ssrLooseEqual(skill.level, 4)) ? " selected" : ""}>4</option><option${ssrRenderAttr("value", 5)} data-v-7f74233e${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 5) : ssrLooseEqual(skill.level, 5)) ? " selected" : ""}>5</option></select></div><button type="button" class="remove-skill" data-v-7f74233e>×</button></div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div></div><div class="main-wrapper" data-v-7f74233e><div class="tabs" data-v-7f74233e><button class="${ssrRenderClass({ active: activeTab.value === "all" })}" data-v-7f74233e> Все посты </button><button class="${ssrRenderClass({ active: activeTab.value === "foryou" })}" data-v-7f74233e> Для вас </button></div><div class="${ssrRenderClass([{ "list-mode": viewMode.value === "list" }, "posts"])}" data-v-7f74233e>`);
			if (displayedPosts.value.length > 0) {
				_push(`<!--[-->`);
				ssrRenderList(displayedPosts.value, (post) => {
					_push(ssrRenderComponent(Post_default, {
						key: post.id,
						post
					}, null, _parent));
				});
				_push(`<!--]-->`);
			} else {
				_push(`<!--[-->`);
				if (activeTab.value === "foryou" && !authUser.value) {
					_push(`<p class="empty-message" data-v-7f74233e> Чтобы подобрать для вас лучшую работу — `);
					_push(ssrRenderComponent(unref(Link), { href: "/login/" }, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`авторизуйтесь`);
							else return [createTextVNode("авторизуйтесь")];
						}),
						_: 1
					}, _parent));
					_push(`</p>`);
				} else _push(`<p class="empty-message" data-v-7f74233e>Пока ничего нет</p>`);
				_push(`<!--]-->`);
			}
			_push(`</div></div></div><!--]-->`);
		};
	}
});
var _sfc_setup$11 = _sfc_main$11.setup;
_sfc_main$11.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Home.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var Home_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$11, [["__scopeId", "data-v-7f74233e"]]);
//#endregion
//#region resources/js/Pages/Posts/Create.vue
var Create_exports = /* @__PURE__ */ __exportAll({ default: () => Create_default });
var _sfc_main$10 = {
	__name: "Create",
	__ssrInlineRender: true,
	props: { skills: {
		type: Array,
		default: () => []
	} },
	setup(__props) {
		const fileInputRef = ref(null);
		const imagePreviewRef = ref(null);
		const imagePreview = ref(null);
		const isDragging = ref(false);
		const postType = ref("regular");
		const form = useForm({
			title: "",
			description: "",
			image: null,
			position: "",
			budget_min: null,
			budget_max: null,
			deadline: "",
			requirements: "",
			skills: []
		});
		const handleAreaClick = () => {
			if (!imagePreview.value) fileInputRef.value.click();
		};
		const handleImageClick = () => {
			fileInputRef.value.click();
		};
		const handleFileSelect = (e) => {
			const file = e.target.files[0];
			if (file) processFile(file);
		};
		const handleDragOver = () => {
			if (!imagePreview.value) isDragging.value = true;
		};
		const handleDragLeave = () => {
			isDragging.value = false;
		};
		const handleDrop = (e) => {
			isDragging.value = false;
			if (!imagePreview.value) {
				const file = e.dataTransfer.files[0];
				if (file && file.type.startsWith("image/")) processFile(file);
			}
		};
		const processFile = (file) => {
			form.image = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview.value = e.target.result;
			};
			reader.readAsDataURL(file);
		};
		const handleImageLoad = () => {};
		const submit = () => {
			const url = postType.value === "vacancy" ? "/posts/vacancy" : "/posts";
			form.post(url, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					form.reset();
					imagePreview.value = null;
				}
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Создать новый пост" }, null, _parent, _scopeId));
						_push(`<div class="create-post-page" data-v-dc7d5ab0${_scopeId}><form data-v-dc7d5ab0${_scopeId}><div class="post-type-toggle" data-v-dc7d5ab0${_scopeId}><button type="button" class="${ssrRenderClass({ active: postType.value === "regular" })}" data-v-dc7d5ab0${_scopeId}> Обычный пост </button><button type="button" class="${ssrRenderClass({ active: postType.value === "vacancy" })}" data-v-dc7d5ab0${_scopeId}> Вакансия </button></div><div class="block" data-v-dc7d5ab0${_scopeId}><div class="${ssrRenderClass([{ "has-image": imagePreview.value }, "image-container"])}" data-v-dc7d5ab0${_scopeId}><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-dc7d5ab0${_scopeId}>`);
						if (!imagePreview.value) _push(`<div class="${ssrRenderClass([{ dragging: isDragging.value }, "upload-area"])}" data-v-dc7d5ab0${_scopeId}><div class="upload-instructions" data-v-dc7d5ab0${_scopeId}><p data-v-dc7d5ab0${_scopeId}>Перетащите изображение сюда или кликните для выбора</p><button type="button" class="upload-button" data-v-dc7d5ab0${_scopeId}>+</button></div></div>`);
						else _push(`<img${ssrRenderAttr("src", imagePreview.value)} class="post-image" data-v-dc7d5ab0${_scopeId}>`);
						if (imagePreview.value) _push(`<div class="image-overlay" data-v-dc7d5ab0${_scopeId}><button type="button" class="change-image-btn" data-v-dc7d5ab0${_scopeId}> Изменить фото </button></div>`);
						else _push(`<!---->`);
						_push(`</div><div class="content-wrapper" data-v-dc7d5ab0${_scopeId}><div class="desc" data-v-dc7d5ab0${_scopeId}>`);
						if (postType.value === "regular") _push(`<!--[--><input type="text"${ssrRenderAttr("value", unref(form).title)} placeholder="Заголовок поста" required class="title-input" data-v-dc7d5ab0${_scopeId}><textarea placeholder="Описание поста" required class="description-textarea" data-v-dc7d5ab0${_scopeId}>${ssrInterpolate(unref(form).description)}</textarea><!--]-->`);
						else _push(`<!---->`);
						if (postType.value === "vacancy") {
							_push(`<div class="vacancy-fields" data-v-dc7d5ab0${_scopeId}><div class="form-row" data-v-dc7d5ab0${_scopeId}><div class="form-group" data-v-dc7d5ab0${_scopeId}><label for="position" data-v-dc7d5ab0${_scopeId}>Должность</label><input type="text"${ssrRenderAttr("value", unref(form).position)} id="position" placeholder="Например: PHP разработчик" data-v-dc7d5ab0${_scopeId}></div></div><div class="form-row two-cols" data-v-dc7d5ab0${_scopeId}><div class="form-group" data-v-dc7d5ab0${_scopeId}><label for="budget_min" data-v-dc7d5ab0${_scopeId}>Бюджет от</label><input type="number"${ssrRenderAttr("value", unref(form).budget_min)} id="budget_min" placeholder="1000" data-v-dc7d5ab0${_scopeId}></div><div class="form-group" data-v-dc7d5ab0${_scopeId}><label for="budget_max" data-v-dc7d5ab0${_scopeId}>Бюджет до</label><input type="number"${ssrRenderAttr("value", unref(form).budget_max)} id="budget_max" placeholder="5000" data-v-dc7d5ab0${_scopeId}></div></div><div class="form-row" data-v-dc7d5ab0${_scopeId}><div class="form-group" data-v-dc7d5ab0${_scopeId}><label for="deadline" data-v-dc7d5ab0${_scopeId}>Срок выполнения</label><input type="date"${ssrRenderAttr("value", unref(form).deadline)} id="deadline" data-v-dc7d5ab0${_scopeId}></div></div><div class="form-row" data-v-dc7d5ab0${_scopeId}><div class="form-group" data-v-dc7d5ab0${_scopeId}><label data-v-dc7d5ab0${_scopeId}>Требуемые навыки</label>`);
							_push(ssrRenderComponent(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, _parent, _scopeId));
							_push(`</div></div><div class="form-row" data-v-dc7d5ab0${_scopeId}><div class="form-group" data-v-dc7d5ab0${_scopeId}><label for="requirements" data-v-dc7d5ab0${_scopeId}>Требования</label><textarea id="requirements" placeholder="Опишите требования к исполнителю..." class="requirements-textarea" data-v-dc7d5ab0${_scopeId}>${ssrInterpolate(unref(form).requirements)}</textarea></div></div></div>`);
						} else _push(`<!---->`);
						_push(`<div class="form-actions" data-v-dc7d5ab0${_scopeId}><button type="submit" class="submit-button"${ssrIncludeBooleanAttr(unref(form).processing || !unref(form).image) ? " disabled" : ""} data-v-dc7d5ab0${_scopeId}>${ssrInterpolate(unref(form).processing ? "Публикация..." : postType.value === "vacancy" ? "Опубликовать вакансию" : "Опубликовать")}</button></div></div></div></div></form></div>`);
					} else return [createVNode(unref(Head), { title: "Создать новый пост" }), createVNode("div", { class: "create-post-page" }, [createVNode("form", { onSubmit: withModifiers(submit, ["prevent"]) }, [createVNode("div", { class: "post-type-toggle" }, [createVNode("button", {
						type: "button",
						class: { active: postType.value === "regular" },
						onClick: ($event) => postType.value = "regular"
					}, " Обычный пост ", 10, ["onClick"]), createVNode("button", {
						type: "button",
						class: { active: postType.value === "vacancy" },
						onClick: ($event) => postType.value = "vacancy"
					}, " Вакансия ", 10, ["onClick"])]), createVNode("div", { class: "block" }, [createVNode("div", {
						class: ["image-container", { "has-image": imagePreview.value }],
						onClick: handleAreaClick,
						onDragover: withModifiers(handleDragOver, ["prevent"]),
						onDragleave: handleDragLeave,
						onDrop: withModifiers(handleDrop, ["prevent"])
					}, [
						createVNode("input", {
							type: "file",
							ref_key: "fileInputRef",
							ref: fileInputRef,
							accept: "image/*",
							style: { "display": "none" },
							onChange: handleFileSelect
						}, null, 544),
						!imagePreview.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: ["upload-area", { dragging: isDragging.value }]
						}, [createVNode("div", { class: "upload-instructions" }, [createVNode("p", null, "Перетащите изображение сюда или кликните для выбора"), createVNode("button", {
							type: "button",
							class: "upload-button"
						}, "+")])], 2)) : (openBlock(), createBlock("img", {
							key: 1,
							src: imagePreview.value,
							ref_key: "imagePreviewRef",
							ref: imagePreviewRef,
							class: "post-image",
							onLoad: handleImageLoad,
							onClick: withModifiers(handleImageClick, ["stop"])
						}, null, 40, ["src"])),
						imagePreview.value ? (openBlock(), createBlock("div", {
							key: 2,
							class: "image-overlay"
						}, [createVNode("button", {
							type: "button",
							onClick: withModifiers(handleImageClick, ["stop"]),
							class: "change-image-btn"
						}, " Изменить фото ")])) : createCommentVNode("", true)
					], 34), createVNode("div", { class: "content-wrapper" }, [createVNode("div", { class: "desc" }, [
						postType.value === "regular" ? (openBlock(), createBlock(Fragment, { key: 0 }, [withDirectives(createVNode("input", {
							type: "text",
							"onUpdate:modelValue": ($event) => unref(form).title = $event,
							placeholder: "Заголовок поста",
							required: "",
							class: "title-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).title]]), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							placeholder: "Описание поста",
							required: "",
							class: "description-textarea"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).description]])], 64)) : createCommentVNode("", true),
						postType.value === "vacancy" ? (openBlock(), createBlock("div", {
							key: 1,
							class: "vacancy-fields"
						}, [
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "position" }, "Должность"), withDirectives(createVNode("input", {
								type: "text",
								"onUpdate:modelValue": ($event) => unref(form).position = $event,
								id: "position",
								placeholder: "Например: PHP разработчик"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).position]])])]),
							createVNode("div", { class: "form-row two-cols" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_min" }, "Бюджет от"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_min = $event,
								id: "budget_min",
								placeholder: "1000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_min]])]), createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_max" }, "Бюджет до"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_max = $event,
								id: "budget_max",
								placeholder: "5000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_max]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "deadline" }, "Срок выполнения"), withDirectives(createVNode("input", {
								type: "date",
								"onUpdate:modelValue": ($event) => unref(form).deadline = $event,
								id: "deadline"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).deadline]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", null, "Требуемые навыки"), createVNode(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, 8, [
								"skills",
								"modelValue",
								"onUpdate:modelValue"
							])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "requirements" }, "Требования"), withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => unref(form).requirements = $event,
								id: "requirements",
								placeholder: "Опишите требования к исполнителю...",
								class: "requirements-textarea"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).requirements]])])])
						])) : createCommentVNode("", true),
						createVNode("div", { class: "form-actions" }, [createVNode("button", {
							type: "submit",
							class: "submit-button",
							disabled: unref(form).processing || !unref(form).image
						}, toDisplayString(unref(form).processing ? "Публикация..." : postType.value === "vacancy" ? "Опубликовать вакансию" : "Опубликовать"), 9, ["disabled"])])
					])])])], 32)])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$10 = _sfc_main$10.setup;
_sfc_main$10.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Posts/Create.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var Create_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$10, [["__scopeId", "data-v-dc7d5ab0"]]);
//#endregion
//#region resources/js/Pages/Posts/Edit.vue
var Edit_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Edit_default$1 });
var _sfc_main$9 = {
	__name: "Edit",
	__ssrInlineRender: true,
	props: {
		post: Object,
		skills: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const fileInputRef = ref(null);
		const imagePreview = ref(props.post.image_url);
		const isDragging = ref(false);
		const isVacancy = computed(() => props.post.vacancy !== null);
		const form = useForm({
			title: props.post.title,
			description: props.post.description,
			image: null,
			position: props.post.vacancy?.position || "",
			budget_min: props.post.vacancy?.budget_min || "",
			budget_max: props.post.vacancy?.budget_max || "",
			deadline: props.post.vacancy?.deadline || "",
			requirements: props.post.vacancy?.requirements || "",
			skills: [],
			_method: "PUT"
		});
		onMounted(() => {
			if (props.post.vacancy && props.post.vacancy.skills) form.skills = props.post.vacancy.skills.map((s) => ({
				id: s.id,
				name: s.name,
				level: s.level || 3
			}));
		});
		const handleAreaClick = () => {
			if (!imagePreview.value) fileInputRef.value.click();
		};
		const handleImageClick = () => {
			fileInputRef.value.click();
		};
		const handleFileSelect = (e) => {
			const file = e.target.files[0];
			if (file) processFile(file);
		};
		const handleDragOver = () => {
			isDragging.value = true;
		};
		const handleDragLeave = () => {
			isDragging.value = false;
		};
		const handleDrop = (e) => {
			isDragging.value = false;
			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith("image/")) processFile(file);
		};
		const processFile = (file) => {
			form.image = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview.value = e.target.result;
			};
			reader.readAsDataURL(file);
		};
		const submit = () => {
			const data = {
				title: form.title,
				description: form.description,
				_method: "PUT"
			};
			if (form.image) data.image = form.image;
			if (isVacancy.value) {
				data.position = form.position;
				data.budget_min = form.budget_min || null;
				data.budget_max = form.budget_max || null;
				data.deadline = form.deadline || null;
				data.requirements = form.requirements || null;
				const skillsWithLevels = {};
				form.skills.forEach((s) => {
					skillsWithLevels[s.id] = { level: s.level };
				});
				data.skills = skillsWithLevels;
			}
			form.transform(() => data).post(props.post.update_url, {
				forceFormData: true,
				preserveScroll: true
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Редактировать пост" }, null, _parent, _scopeId));
						_push(`<div class="edit-post-page" data-v-86a6c64c${_scopeId}><form data-v-86a6c64c${_scopeId}><div class="block" data-v-86a6c64c${_scopeId}><div class="image-container" data-v-86a6c64c${_scopeId}><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-86a6c64c${_scopeId}>`);
						if (imagePreview.value) _push(`<img${ssrRenderAttr("src", imagePreview.value)} class="post-image" data-v-86a6c64c${_scopeId}>`);
						else _push(`<div class="no-image" data-v-86a6c64c${_scopeId}><span data-v-86a6c64c${_scopeId}>Изображение отсутствует</span></div>`);
						if (imagePreview.value) _push(`<div class="image-overlay" data-v-86a6c64c${_scopeId}><button type="button" class="change-image-btn" data-v-86a6c64c${_scopeId}> Изменить фото </button></div>`);
						else _push(`<!---->`);
						_push(`</div><div class="content-wrapper" data-v-86a6c64c${_scopeId}><div class="desc" data-v-86a6c64c${_scopeId}>`);
						if (!isVacancy.value) _push(`<!--[--><input type="text"${ssrRenderAttr("value", unref(form).title)} placeholder="Заголовок поста" required class="title-input" data-v-86a6c64c${_scopeId}><textarea placeholder="Описание поста" required class="description-textarea" data-v-86a6c64c${_scopeId}>${ssrInterpolate(unref(form).description)}</textarea><!--]-->`);
						else {
							_push(`<div class="vacancy-fields" data-v-86a6c64c${_scopeId}><div class="form-row" data-v-86a6c64c${_scopeId}><div class="form-group" data-v-86a6c64c${_scopeId}><label for="position" data-v-86a6c64c${_scopeId}>Должность</label><input type="text"${ssrRenderAttr("value", unref(form).position)} id="position" placeholder="Например: PHP разработчик" data-v-86a6c64c${_scopeId}></div></div><div class="form-row two-cols" data-v-86a6c64c${_scopeId}><div class="form-group" data-v-86a6c64c${_scopeId}><label for="budget_min" data-v-86a6c64c${_scopeId}>Бюджет от</label><input type="number"${ssrRenderAttr("value", unref(form).budget_min)} id="budget_min" placeholder="1000" data-v-86a6c64c${_scopeId}></div><div class="form-group" data-v-86a6c64c${_scopeId}><label for="budget_max" data-v-86a6c64c${_scopeId}>Бюджет до</label><input type="number"${ssrRenderAttr("value", unref(form).budget_max)} id="budget_max" placeholder="5000" data-v-86a6c64c${_scopeId}></div></div><div class="form-row" data-v-86a6c64c${_scopeId}><div class="form-group" data-v-86a6c64c${_scopeId}><label for="deadline" data-v-86a6c64c${_scopeId}>Срок выполнения</label><input type="date"${ssrRenderAttr("value", unref(form).deadline)} id="deadline" data-v-86a6c64c${_scopeId}></div></div><div class="form-row" data-v-86a6c64c${_scopeId}><div class="form-group" data-v-86a6c64c${_scopeId}><label for="requirements" data-v-86a6c64c${_scopeId}>Требования</label><textarea id="requirements" placeholder="Опишите требования к исполнителю..." rows="4" data-v-86a6c64c${_scopeId}>${ssrInterpolate(unref(form).requirements)}</textarea></div></div><div class="form-row" data-v-86a6c64c${_scopeId}><div class="form-group" data-v-86a6c64c${_scopeId}><label data-v-86a6c64c${_scopeId}>Требуемые навыки</label>`);
							_push(ssrRenderComponent(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, _parent, _scopeId));
							_push(`</div></div></div>`);
						}
						if (unref(form).errors.title) _push(`<div class="error" data-v-86a6c64c${_scopeId}>${ssrInterpolate(unref(form).errors.title)}</div>`);
						else _push(`<!---->`);
						if (unref(form).errors.description) _push(`<div class="error" data-v-86a6c64c${_scopeId}>${ssrInterpolate(unref(form).errors.description)}</div>`);
						else _push(`<!---->`);
						if (unref(form).errors.image) _push(`<div class="error" data-v-86a6c64c${_scopeId}>${ssrInterpolate(unref(form).errors.image)}</div>`);
						else _push(`<!---->`);
						_push(`<div class="form-actions" data-v-86a6c64c${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: __props.post.show_url,
							class: "cancel-button"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Отмена`);
								else return [createTextVNode("Отмена")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<button type="submit" class="submit-button"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-86a6c64c${_scopeId}>${ssrInterpolate(unref(form).processing ? "Сохранение..." : "Сохранить")}</button></div></div></div></div></form></div>`);
					} else return [createVNode(unref(Head), { title: "Редактировать пост" }), createVNode("div", { class: "edit-post-page" }, [createVNode("form", { onSubmit: withModifiers(submit, ["prevent"]) }, [createVNode("div", { class: "block" }, [createVNode("div", {
						class: "image-container",
						onClick: handleAreaClick,
						onDragover: withModifiers(handleDragOver, ["prevent"]),
						onDragleave: handleDragLeave,
						onDrop: withModifiers(handleDrop, ["prevent"])
					}, [
						createVNode("input", {
							type: "file",
							ref_key: "fileInputRef",
							ref: fileInputRef,
							accept: "image/*",
							style: { "display": "none" },
							onChange: handleFileSelect
						}, null, 544),
						imagePreview.value ? (openBlock(), createBlock("img", {
							key: 0,
							src: imagePreview.value,
							class: "post-image",
							onClick: withModifiers(handleImageClick, ["stop"])
						}, null, 8, ["src"])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "no-image"
						}, [createVNode("span", null, "Изображение отсутствует")])),
						imagePreview.value ? (openBlock(), createBlock("div", {
							key: 2,
							class: "image-overlay"
						}, [createVNode("button", {
							type: "button",
							onClick: withModifiers(handleImageClick, ["stop"]),
							class: "change-image-btn"
						}, " Изменить фото ")])) : createCommentVNode("", true)
					], 32), createVNode("div", { class: "content-wrapper" }, [createVNode("div", { class: "desc" }, [
						!isVacancy.value ? (openBlock(), createBlock(Fragment, { key: 0 }, [withDirectives(createVNode("input", {
							type: "text",
							"onUpdate:modelValue": ($event) => unref(form).title = $event,
							placeholder: "Заголовок поста",
							required: "",
							class: "title-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).title]]), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							placeholder: "Описание поста",
							required: "",
							class: "description-textarea"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).description]])], 64)) : (openBlock(), createBlock("div", {
							key: 1,
							class: "vacancy-fields"
						}, [
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "position" }, "Должность"), withDirectives(createVNode("input", {
								type: "text",
								"onUpdate:modelValue": ($event) => unref(form).position = $event,
								id: "position",
								placeholder: "Например: PHP разработчик"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).position]])])]),
							createVNode("div", { class: "form-row two-cols" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_min" }, "Бюджет от"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_min = $event,
								id: "budget_min",
								placeholder: "1000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_min]])]), createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_max" }, "Бюджет до"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_max = $event,
								id: "budget_max",
								placeholder: "5000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_max]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "deadline" }, "Срок выполнения"), withDirectives(createVNode("input", {
								type: "date",
								"onUpdate:modelValue": ($event) => unref(form).deadline = $event,
								id: "deadline"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).deadline]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "requirements" }, "Требования"), withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => unref(form).requirements = $event,
								id: "requirements",
								placeholder: "Опишите требования к исполнителю...",
								rows: "4"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).requirements]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", null, "Требуемые навыки"), createVNode(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, 8, [
								"skills",
								"modelValue",
								"onUpdate:modelValue"
							])])])
						])),
						unref(form).errors.title ? (openBlock(), createBlock("div", {
							key: 2,
							class: "error"
						}, toDisplayString(unref(form).errors.title), 1)) : createCommentVNode("", true),
						unref(form).errors.description ? (openBlock(), createBlock("div", {
							key: 3,
							class: "error"
						}, toDisplayString(unref(form).errors.description), 1)) : createCommentVNode("", true),
						unref(form).errors.image ? (openBlock(), createBlock("div", {
							key: 4,
							class: "error"
						}, toDisplayString(unref(form).errors.image), 1)) : createCommentVNode("", true),
						createVNode("div", { class: "form-actions" }, [createVNode(unref(Link), {
							href: __props.post.show_url,
							class: "cancel-button"
						}, {
							default: withCtx(() => [createTextVNode("Отмена")]),
							_: 1
						}, 8, ["href"]), createVNode("button", {
							type: "submit",
							class: "submit-button",
							disabled: unref(form).processing
						}, toDisplayString(unref(form).processing ? "Сохранение..." : "Сохранить"), 9, ["disabled"])])
					])])])], 32)])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Posts/Edit.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var Edit_default$1 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$9, [["__scopeId", "data-v-86a6c64c"]]);
//#endregion
//#region resources/js/Pages/Posts/Show.vue
var Show_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Show_default$1 });
var _sfc_main$8 = /* @__PURE__ */ Object.assign({ layout: _sfc_main$21 }, {
	__name: "Show",
	__ssrInlineRender: true,
	props: { post: {
		type: Object,
		required: true
	} },
	setup(__props) {
		const menuOpen = ref(false);
		const activeTab = ref("comments");
		const commentErrors = ref({});
		const showRespondModal = ref(false);
		const showReportModal = ref(false);
		const showShareModal = ref(false);
		const reportErrors = ref({});
		const shareErrors = ref({});
		const respondForm = useForm({
			cover_letter: "",
			proposed_price: ""
		});
		const reportForm = useForm({ reason: "" });
		const shareForm = useForm({
			users: [],
			message: ""
		});
		const props = __props;
		const page = usePage();
		const commentForm = useForm({ text: "" });
		const canEdit = computed(() => {
			return page.props.auth.user && page.props.auth.user.id === props.post.user.id;
		});
		const isAuthor = computed(() => {
			return page.props.auth.user && page.props.auth.user.id === props.post.user.id;
		});
		const canReport = computed(() => {
			return page.props.auth.user && page.props.auth.user.id !== props.post.user.id;
		});
		const sharedChats = computed(() => {
			return props.post.shared_chats || [];
		});
		const formattedDate = computed(() => {
			if (props.post.created_at) return new Date(props.post.created_at).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
			return "";
		});
		const getApplicationsWord = (count) => {
			return [
				"отклик",
				"отклика",
				"откликов"
			][count % 100 > 4 && count % 100 < 20 ? 2 : [
				2,
				0,
				1,
				1,
				1,
				2
			][Math.min(count % 10, 5)]];
		};
		const formatDate = (dateString) => {
			const date = new Date(dateString);
			const diffInSeconds = Math.floor((/* @__PURE__ */ new Date() - date) / 1e3);
			if (diffInSeconds < 60) return "только что";
			if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
			if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
			return date.toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "short",
				year: diffInSeconds > 31536e3 ? "numeric" : void 0
			});
		};
		const formatDeadline = (dateString) => {
			return new Date(dateString).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric"
			});
		};
		const closeMenuOnClickOutside = (event) => {
			const menuContainer = document.querySelector(".menu-container");
			if (menuContainer && !menuContainer.contains(event.target)) menuOpen.value = false;
		};
		onMounted(() => {
			document.addEventListener("click", closeMenuOnClickOutside);
		});
		onUnmounted(() => {
			document.removeEventListener("click", closeMenuOnClickOutside);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)} data-v-aa34cd6d>`);
			_push(ssrRenderComponent(unref(Head), { title: __props.post.title }, null, _parent));
			_push(`<div class="block" data-v-aa34cd6d><div class="image-container" data-v-aa34cd6d>`);
			if (__props.post.image_url) _push(`<img${ssrRenderAttr("src", __props.post.image_url)}${ssrRenderAttr("alt", __props.post.title)} class="post-image" data-v-aa34cd6d>`);
			else _push(`<div class="no-image" data-v-aa34cd6d><span data-v-aa34cd6d>Изображение отсутствует</span></div>`);
			_push(`</div><div class="content-wrapper" data-v-aa34cd6d>`);
			if (__props.post.is_hidden) _push(`<div class="hidden-warning" data-v-aa34cd6d> ⚠️ Этот пост скрыт администрацией и виден только вам </div>`);
			else _push(`<!---->`);
			_push(`<div class="desc" data-v-aa34cd6d><div class="header-actions" data-v-aa34cd6d>`);
			if (__props.post.is_vacancy) _push(`<h2 class="title" data-v-aa34cd6d>Вакансия: ${ssrInterpolate(__props.post.vacancy.position)}</h2>`);
			else _push(`<h2 class="title" data-v-aa34cd6d>${ssrInterpolate(__props.post.title)}</h2>`);
			if (canEdit.value || canReport.value) {
				_push(`<div class="menu-container" data-v-aa34cd6d><button class="menu-btn" type="button" data-v-aa34cd6d><img src="/images/dots.svg" alt="меню" data-v-aa34cd6d></button>`);
				if (menuOpen.value) {
					_push(`<div class="post-dropdown-menu" data-v-aa34cd6d><button class="menu-item" data-v-aa34cd6d><img src="/images/share.svg" alt="" data-v-aa34cd6d>Поделиться </button>`);
					if (__props.post.edit_url) _push(ssrRenderComponent(unref(Link), {
						href: __props.post.edit_url,
						class: "menu-item"
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<img src="/images/edit.svg" alt="" data-v-aa34cd6d${_scopeId}>Редактировать `);
							else return [createVNode("img", {
								src: "/images/edit.svg",
								alt: ""
							}), createTextVNode("Редактировать ")];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					if (__props.post.delete_url) _push(`<button class="menu-item delete" data-v-aa34cd6d><img src="/images/trash.svg" alt="" data-v-aa34cd6d> Удалить </button>`);
					else _push(`<!---->`);
					if (canReport.value) _push(`<button class="menu-item" data-v-aa34cd6d><img src="/images/flag.svg" alt="" data-v-aa34cd6d>Пожаловаться </button>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			_push(ssrRenderComponent(unref(Link), {
				href: __props.post.user.profile_url,
				class: "author-link"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.post.user.avatar_url) _push(`<img${ssrRenderAttr("src", __props.post.user.avatar_url)} class="author-avatar"${ssrRenderAttr("alt", __props.post.user.name)} data-v-aa34cd6d${_scopeId}>`);
						else _push(`<img src="/images/User-avatar.png" class="author-avatar"${ssrRenderAttr("alt", __props.post.user.name)} data-v-aa34cd6d${_scopeId}>`);
						_push(` ${ssrInterpolate(__props.post.user.name)}`);
					} else return [__props.post.user.avatar_url ? (openBlock(), createBlock("img", {
						key: 0,
						src: __props.post.user.avatar_url,
						class: "author-avatar",
						alt: __props.post.user.name
					}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
						key: 1,
						src: "/images/User-avatar.png",
						class: "author-avatar",
						alt: __props.post.user.name
					}, null, 8, ["alt"])), createTextVNode(" " + toDisplayString(__props.post.user.name), 1)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="post-actions" data-v-aa34cd6d><button type="button" class="${ssrRenderClass([{ liked: __props.post.is_liked }, "like-btn"])}" data-v-aa34cd6d>${ssrInterpolate(__props.post.is_liked ? "❤️" : "🤍")} ${ssrInterpolate(__props.post.likes_count)}</button></div>`);
			if (__props.post.is_vacancy) {
				_push(`<!--[--><div class="vacancy-info" data-v-aa34cd6d>`);
				if (__props.post.vacancy.budget_min || __props.post.vacancy.budget_max) _push(`<div class="vacancy-budget" data-v-aa34cd6d><span class="label" data-v-aa34cd6d>Бюджет:</span><span class="value" data-v-aa34cd6d>${ssrInterpolate(__props.post.vacancy.budget_min ? __props.post.vacancy.budget_min + " ₽" : "")} ${ssrInterpolate(__props.post.vacancy.budget_min && __props.post.vacancy.budget_max ? " - " : "")} ${ssrInterpolate(__props.post.vacancy.budget_max ? __props.post.vacancy.budget_max + " ₽" : "")}</span></div>`);
				else _push(`<!---->`);
				if (__props.post.vacancy.deadline) _push(`<div class="vacancy-deadline" data-v-aa34cd6d><span class="label" data-v-aa34cd6d>Срок:</span><span class="value" data-v-aa34cd6d>${ssrInterpolate(formatDeadline(__props.post.vacancy.deadline))}</span></div>`);
				else _push(`<!---->`);
				if (__props.post.vacancy.skills && __props.post.vacancy.skills.length > 0) {
					_push(`<div class="vacancy-skills" data-v-aa34cd6d><span class="label" data-v-aa34cd6d>Требуемые навыки:</span><div class="skills-list" data-v-aa34cd6d><!--[-->`);
					ssrRenderList(__props.post.vacancy.skills, (skill) => {
						_push(`<span class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-aa34cd6d>${ssrInterpolate(skill.name)} <span class="skill-level" data-v-aa34cd6d>★ ${ssrInterpolate(skill.level)}</span></span>`);
					});
					_push(`<!--]--></div>`);
					if (__props.post.vacancy.requirements) _push(`<div class="vacancy-requirements" data-v-aa34cd6d><span class="label" data-v-aa34cd6d>Требования:</span><p class="requirements-text" data-v-aa34cd6d>${ssrInterpolate(__props.post.vacancy.requirements)}</p></div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
				if (__props.post.vacancy && __props.post.vacancy.status === "open") {
					_push(`<div class="vacancy-actions" data-v-aa34cd6d>`);
					if (__props.post.vacancy.applications_count > 0) _push(`<div class="applications-count" data-v-aa34cd6d>${ssrInterpolate(__props.post.vacancy.applications_count)} ${ssrInterpolate(getApplicationsWord(__props.post.vacancy.applications_count))} на эту вакансию </div>`);
					else _push(`<!---->`);
					if (!isAuthor.value && __props.post.respond_url) _push(`<button class="respond-btn"${ssrIncludeBooleanAttr(__props.post.has_application) ? " disabled" : ""} data-v-aa34cd6d>${ssrInterpolate(__props.post.has_application ? "Вы уже откликнулись" : "Откликнуться")}</button>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<p class="description" data-v-aa34cd6d>${ssrInterpolate(__props.post.description)}</p>`);
			_push(`<div class="meta" data-v-aa34cd6d><small data-v-aa34cd6d>${ssrInterpolate(formattedDate.value)}</small></div></div></div></div><div class="comments-section-wrapper" data-v-aa34cd6d>`);
			if (__props.post.is_vacancy && canEdit.value) _push(`<div class="tabs" data-v-aa34cd6d><button class="${ssrRenderClass([{ active: activeTab.value === "applications" }, "tab"])}" data-v-aa34cd6d> Список откликнувшихся (${ssrInterpolate(__props.post.vacancy.applications?.length || 0)}) </button><button class="${ssrRenderClass([{ active: activeTab.value === "comments" }, "tab"])}" data-v-aa34cd6d> Комментарии (${ssrInterpolate(__props.post.comments.length)}) </button></div>`);
			else _push(`<!---->`);
			_push(`<div class="comments-section" data-v-aa34cd6d>`);
			if (!__props.post.is_vacancy || !canEdit.value || activeTab.value === "comments") {
				_push(`<!--[-->`);
				if (_ctx.$page.props.auth.user) {
					_push(`<div class="comment-form" data-v-aa34cd6d><form data-v-aa34cd6d>`);
					if (commentErrors.value.text) _push(`<div class="error" data-v-aa34cd6d>${ssrInterpolate(commentErrors.value.text)}</div>`);
					else _push(`<!---->`);
					_push(`<textarea required placeholder="Напишите комментарий"${ssrIncludeBooleanAttr(unref(commentForm).processing) ? " disabled" : ""} data-v-aa34cd6d>${ssrInterpolate(unref(commentForm).text)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(commentForm).processing) ? " disabled" : ""} data-v-aa34cd6d>${ssrInterpolate(unref(commentForm).processing ? "Отправка..." : "Добавить комментарий")}</button></form></div>`);
				} else {
					_push(`<div class="login-prompt" data-v-aa34cd6d><p data-v-aa34cd6d>Чтобы оставить комментарий, `);
					_push(ssrRenderComponent(unref(Link), { href: "/login" }, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`войдите`);
							else return [createTextVNode("войдите")];
						}),
						_: 1
					}, _parent));
					_push(` или `);
					_push(ssrRenderComponent(unref(Link), { href: "/register" }, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`зарегистрируйтесь`);
							else return [createTextVNode("зарегистрируйтесь")];
						}),
						_: 1
					}, _parent));
					_push(`</p></div>`);
				}
				_push(`<h3 data-v-aa34cd6d>Комментарии (${ssrInterpolate(__props.post.comments.length)})</h3>`);
				if (__props.post.comments.length === 0) _push(`<div class="no-comments" data-v-aa34cd6d><p data-v-aa34cd6d>Комментариев пока нет. Будьте первым!</p></div>`);
				else {
					_push(`<div class="comments" data-v-aa34cd6d><!--[-->`);
					ssrRenderList(__props.post.comments, (comment) => {
						_push(`<div class="comment" data-v-aa34cd6d><div class="comment-header" data-v-aa34cd6d>`);
						_push(ssrRenderComponent(unref(Link), {
							href: comment.user.profile_url,
							class: "comment-author"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									if (comment.user.avatar_url) _push(`<img${ssrRenderAttr("src", comment.user.avatar_url)} class="comment-avatar"${ssrRenderAttr("alt", comment.user.name)} data-v-aa34cd6d${_scopeId}>`);
									else _push(`<img src="/images/User-avatar.png" class="comment-avatar"${ssrRenderAttr("alt", comment.user.name)} data-v-aa34cd6d${_scopeId}>`);
									_push(`<span class="comment-author-name" data-v-aa34cd6d${_scopeId}>${ssrInterpolate(comment.user.name)}</span>`);
								} else return [comment.user.avatar_url ? (openBlock(), createBlock("img", {
									key: 0,
									src: comment.user.avatar_url,
									class: "comment-avatar",
									alt: comment.user.name
								}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
									key: 1,
									src: "/images/User-avatar.png",
									class: "comment-avatar",
									alt: comment.user.name
								}, null, 8, ["alt"])), createVNode("span", { class: "comment-author-name" }, toDisplayString(comment.user.name), 1)];
							}),
							_: 2
						}, _parent));
						_push(`<small class="comment-date" data-v-aa34cd6d>${ssrInterpolate(formatDate(comment.created_at))}</small></div><div class="comment-body" data-v-aa34cd6d><p data-v-aa34cd6d>${ssrInterpolate(comment.text)}</p></div></div>`);
					});
					_push(`<!--]--></div>`);
				}
				_push(`<!--]-->`);
			} else if (activeTab.value === "applications") {
				_push(`<!--[--><h3 data-v-aa34cd6d>Список откликнувшихся (${ssrInterpolate(__props.post.vacancy.applications?.length || 0)})</h3>`);
				if (!__props.post.vacancy.applications || __props.post.vacancy.applications.length === 0) _push(`<div class="no-comments" data-v-aa34cd6d><p data-v-aa34cd6d>На эту вакансию пока никто не откликнулся.</p></div>`);
				else {
					_push(`<div class="comments" data-v-aa34cd6d><!--[-->`);
					ssrRenderList(__props.post.vacancy.applications, (application) => {
						_push(`<div class="comment" data-v-aa34cd6d><div class="comment-header" data-v-aa34cd6d>`);
						_push(ssrRenderComponent(unref(Link), {
							href: application.user.profile_url,
							class: "comment-author"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									if (application.user.avatar_url) _push(`<img${ssrRenderAttr("src", application.user.avatar_url)} class="comment-avatar"${ssrRenderAttr("alt", application.user.name)} data-v-aa34cd6d${_scopeId}>`);
									else _push(`<img src="/images/User-avatar.png" class="comment-avatar"${ssrRenderAttr("alt", application.user.name)} data-v-aa34cd6d${_scopeId}>`);
									_push(`<span class="comment-author-name" data-v-aa34cd6d${_scopeId}>${ssrInterpolate(application.user.name)}</span>`);
								} else return [application.user.avatar_url ? (openBlock(), createBlock("img", {
									key: 0,
									src: application.user.avatar_url,
									class: "comment-avatar",
									alt: application.user.name
								}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
									key: 1,
									src: "/images/User-avatar.png",
									class: "comment-avatar",
									alt: application.user.name
								}, null, 8, ["alt"])), createVNode("span", { class: "comment-author-name" }, toDisplayString(application.user.name), 1)];
							}),
							_: 2
						}, _parent));
						_push(`<div class="comment-header-right" data-v-aa34cd6d><small class="comment-date" data-v-aa34cd6d>${ssrInterpolate(formatDate(application.created_at))}</small></div></div><div class="comment-body" data-v-aa34cd6d><div data-v-aa34cd6d>`);
						if (application.cover_letter) _push(`<p data-v-aa34cd6d>${ssrInterpolate(application.cover_letter)}</p>`);
						else _push(`<!---->`);
						if (application.proposed_price) _push(`<p class="proposed-price" data-v-aa34cd6d>Предложенная цена: ${ssrInterpolate(application.proposed_price)} ₽</p>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (application.chat_url) _push(ssrRenderComponent(unref(Link), {
							href: application.chat_url,
							class: "chat-btn"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Открыть чат `);
								else return [createTextVNode(" Открыть чат ")];
							}),
							_: 2
						}, _parent));
						else _push(`<!---->`);
						_push(`</div></div>`);
					});
					_push(`<!--]--></div>`);
				}
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
			if (showRespondModal.value) {
				_push(`<div class="modal-overlay" data-v-aa34cd6d><div class="modal-content" data-v-aa34cd6d><button class="modal-close" data-v-aa34cd6d>×</button><h2 data-v-aa34cd6d>Отклик на вакансию</h2><form data-v-aa34cd6d><div class="form-group" data-v-aa34cd6d><label for="cover_letter" data-v-aa34cd6d>Сопроводительное письмо *</label><textarea id="cover_letter" required placeholder="Расскажите о себе и почему вы подходите на эту вакансию..." rows="6" data-v-aa34cd6d>${ssrInterpolate(unref(respondForm).cover_letter)}</textarea>`);
				if (unref(respondForm).errors.cover_letter) _push(`<div class="error" data-v-aa34cd6d>${ssrInterpolate(unref(respondForm).errors.cover_letter)}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-group" data-v-aa34cd6d><label for="proposed_price" data-v-aa34cd6d>Предложенная цена (₽)</label><input type="number" id="proposed_price"${ssrRenderAttr("value", unref(respondForm).proposed_price)} min="1" max="9999999999" placeholder="Ваша цена" data-v-aa34cd6d>`);
				if (unref(respondForm).errors.proposed_price) _push(`<div class="error" data-v-aa34cd6d>${ssrInterpolate(unref(respondForm).errors.proposed_price)}</div>`);
				else _push(`<!---->`);
				_push(`</div><button type="submit" class="submit-btn"${ssrIncludeBooleanAttr(unref(respondForm).processing) ? " disabled" : ""} data-v-aa34cd6d>${ssrInterpolate(unref(respondForm).processing ? "Отправка..." : "Отправить отклик")}</button></form></div></div>`);
			} else _push(`<!---->`);
			if (showReportModal.value) {
				_push(`<div class="modal-overlay" data-v-aa34cd6d><div class="modal-content" data-v-aa34cd6d><button class="modal-close" data-v-aa34cd6d>×</button><h2 data-v-aa34cd6d>Пожаловаться на пост</h2><form data-v-aa34cd6d><div class="form-group" data-v-aa34cd6d><label for="report_reason" data-v-aa34cd6d>Причина жалобы *</label><textarea id="report_reason" required placeholder="Опишите причину жалобы..." rows="4" data-v-aa34cd6d>${ssrInterpolate(unref(reportForm).reason)}</textarea>`);
				if (reportErrors.value.reason) _push(`<div class="error" data-v-aa34cd6d>${ssrInterpolate(reportErrors.value.reason)}</div>`);
				else _push(`<!---->`);
				_push(`</div><button type="submit" class="submit-btn"${ssrIncludeBooleanAttr(unref(reportForm).processing) ? " disabled" : ""} data-v-aa34cd6d>${ssrInterpolate(unref(reportForm).processing ? "Отправка..." : "Отправить жалобу")}</button></form></div></div>`);
			} else _push(`<!---->`);
			if (showShareModal.value) {
				_push(`<div class="modal-overlay" data-v-aa34cd6d><div class="modal-content" data-v-aa34cd6d><button class="modal-close" data-v-aa34cd6d>×</button><h2 data-v-aa34cd6d>Поделиться постом</h2><form data-v-aa34cd6d><div class="form-group" data-v-aa34cd6d><label data-v-aa34cd6d>Выберите чаты для отправки *</label>`);
				if (sharedChats.value.length === 0) _push(`<div class="no-chats" data-v-aa34cd6d><p data-v-aa34cd6d>У вас нет чатов для отправки поста.</p></div>`);
				else {
					_push(`<div class="chat-list" data-v-aa34cd6d><!--[-->`);
					ssrRenderList(sharedChats.value, (chat) => {
						_push(`<div class="chat-item" data-v-aa34cd6d><label class="chat-label" data-v-aa34cd6d><input type="checkbox"${ssrRenderAttr("value", chat.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(shareForm).users) ? ssrLooseContain(unref(shareForm).users, chat.id) : unref(shareForm).users) ? " checked" : ""} data-v-aa34cd6d><span class="chat-info" data-v-aa34cd6d>`);
						if (chat.other_user && chat.other_user.avatar_url) _push(`<img${ssrRenderAttr("src", chat.other_user.avatar_url)} class="chat-avatar"${ssrRenderAttr("alt", chat.other_user.name)} data-v-aa34cd6d>`);
						else _push(`<img src="/images/User-avatar.png" class="chat-avatar"${ssrRenderAttr("alt", chat.other_user ? chat.other_user.name : "Неизвестный пользователь")} data-v-aa34cd6d>`);
						_push(`<span class="chat-name" data-v-aa34cd6d>${ssrInterpolate(chat.other_user ? chat.other_user.name : "Неизвестный пользователь")}</span></span></label></div>`);
					});
					_push(`<!--]--></div>`);
				}
				if (shareErrors.value.users) _push(`<div class="error" data-v-aa34cd6d>${ssrInterpolate(shareErrors.value.users)}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-group" data-v-aa34cd6d><label for="share_message" data-v-aa34cd6d>Текст сообщения</label><textarea id="share_message" placeholder="Напишите сообщение к посту..." rows="4" data-v-aa34cd6d>${ssrInterpolate(unref(shareForm).message)}</textarea></div><button type="submit" class="submit-btn"${ssrIncludeBooleanAttr(unref(shareForm).processing) ? " disabled" : ""} data-v-aa34cd6d>${ssrInterpolate(unref(shareForm).processing ? "Отправка..." : "Отправить")}</button></form></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
var _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Posts/Show.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var Show_default$1 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$8, [["__scopeId", "data-v-aa34cd6d"]]);
//#endregion
//#region resources/js/Pages/Profile/Edit.vue
var Edit_exports = /* @__PURE__ */ __exportAll({ default: () => Edit_default });
var maxLength$1 = 1e3;
var warningThreshold$1 = 50;
var _sfc_main$7 = {
	__name: "Edit",
	__ssrInlineRender: true,
	props: {
		user: Object,
		skills: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const avatarPreview = ref(null);
		const form = useForm({
			name: props.user.name,
			aboutme: props.user.aboutme || "",
			avatar: null,
			skills: props.user.skills || [],
			_method: "PUT"
		});
		const currentLength = computed(() => (form.aboutme || "").length);
		const remainingChars = computed(() => maxLength$1 - currentLength.value);
		const pluralizeChars = (count) => {
			if (count === 1) return "символ";
			if (count >= 2 && count <= 4) return "символа";
			return "символов";
		};
		const handleAvatarChange = (e) => {
			const file = e.target.files[0];
			if (file) {
				form.avatar = file;
				const reader = new FileReader();
				reader.onload = (e) => {
					avatarPreview.value = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		};
		function submit() {
			if (!form.avatar) form.transform((data) => {
				delete data.avatar;
				return data;
			});
			form.post(`/profile/${props.user.id}`, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					if (form.avatar) {
						form.reset("avatar");
						avatarPreview.value = null;
					}
				}
			});
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Редактирование профиля " + __props.user.name }, null, _parent, _scopeId));
						_push(`<div class="editblock" data-v-dd22e348${_scopeId}><div class="edit-container" data-v-dd22e348${_scopeId}><div class="back-link" data-v-dd22e348${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="edit-content" data-v-dd22e348${_scopeId}><div class="avatar" data-v-dd22e348${_scopeId}><div class="profile-header" data-v-dd22e348${_scopeId}>`);
						if (avatarPreview.value) _push(`<img${ssrRenderAttr("src", avatarPreview.value)}${ssrRenderAttr("alt", "Аватарка " + unref(form).name)} data-v-dd22e348${_scopeId}>`);
						else if (__props.user.avatar_url) _push(`<img${ssrRenderAttr("src", __props.user.avatar_url)}${ssrRenderAttr("alt", "Аватарка " + __props.user.name)} data-v-dd22e348${_scopeId}>`);
						else _push(`<img src="/images/User-avatar.png" alt="Аватарка по умолчанию" data-v-dd22e348${_scopeId}>`);
						_push(`</div></div><div class="desc" data-v-dd22e348${_scopeId}><form enctype="multipart/form-data" data-v-dd22e348${_scopeId}><div class="form-group" data-v-dd22e348${_scopeId}><label for="name" data-v-dd22e348${_scopeId}>Имя:</label><input type="text" name="name" id="name"${ssrRenderAttr("value", unref(form).name)} required data-v-dd22e348${_scopeId}></div><div class="form-group" data-v-dd22e348${_scopeId}><label for="avatar" data-v-dd22e348${_scopeId}>Аватарка:</label><input type="file" name="avatar" id="avatar" accept="image/*" data-v-dd22e348${_scopeId}></div><div class="form-group" data-v-dd22e348${_scopeId}><label for="aboutme" data-v-dd22e348${_scopeId}>О себе:</label><textarea name="aboutme" id="aboutme"${ssrRenderAttr("maxlength", maxLength$1)} data-v-dd22e348${_scopeId}>${ssrInterpolate(unref(form).aboutme)}</textarea><div class="${ssrRenderClass([{ warning: remainingChars.value <= warningThreshold$1 }, "char-counter"])}" data-v-dd22e348${_scopeId}>`);
						if (remainingChars.value <= warningThreshold$1) _push(`<span data-v-dd22e348${_scopeId}> Осталось ${ssrInterpolate(remainingChars.value)} ${ssrInterpolate(pluralizeChars(remainingChars.value))}</span>`);
						else _push(`<span data-v-dd22e348${_scopeId}>${ssrInterpolate(currentLength.value)} / ${ssrInterpolate(maxLength$1)}</span>`);
						_push(`</div></div><div class="form-group" data-v-dd22e348${_scopeId}><label data-v-dd22e348${_scopeId}>Ваши навыки:</label>`);
						_push(ssrRenderComponent(SkillsSelector_default, {
							skills: __props.skills,
							modelValue: unref(form).skills,
							"onUpdate:modelValue": ($event) => unref(form).skills = $event
						}, null, _parent, _scopeId));
						_push(`</div><div class="form-actions" data-v-dd22e348${_scopeId}><button type="submit" class="btn-save"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-dd22e348${_scopeId}>${ssrInterpolate(unref(form).processing ? "Сохранение..." : "Сохранить изменения")}</button>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/profile/" + __props.user.id,
							class: "btn-cancel"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Отмена `);
								else return [createTextVNode(" Отмена ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div></form></div></div></div></div>`);
					} else return [createVNode(unref(Head), { title: "Редактирование профиля " + __props.user.name }, null, 8, ["title"]), createVNode("div", { class: "editblock" }, [createVNode("div", { class: "edit-container" }, [createVNode("div", { class: "back-link" }, [createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
						default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
						_: 1
					}, 8, ["href"])]), createVNode("div", { class: "edit-content" }, [createVNode("div", { class: "avatar" }, [createVNode("div", { class: "profile-header" }, [avatarPreview.value ? (openBlock(), createBlock("img", {
						key: 0,
						src: avatarPreview.value,
						alt: "Аватарка " + unref(form).name
					}, null, 8, ["src", "alt"])) : __props.user.avatar_url ? (openBlock(), createBlock("img", {
						key: 1,
						src: __props.user.avatar_url,
						alt: "Аватарка " + __props.user.name
					}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
						key: 2,
						src: "/images/User-avatar.png",
						alt: "Аватарка по умолчанию"
					}))])]), createVNode("div", { class: "desc" }, [createVNode("form", {
						onSubmit: withModifiers(submit, ["prevent"]),
						enctype: "multipart/form-data"
					}, [
						createVNode("div", { class: "form-group" }, [createVNode("label", { for: "name" }, "Имя:"), withDirectives(createVNode("input", {
							type: "text",
							name: "name",
							id: "name",
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							required: ""
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).name]])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", { for: "avatar" }, "Аватарка:"), createVNode("input", {
							type: "file",
							name: "avatar",
							id: "avatar",
							accept: "image/*",
							onChange: handleAvatarChange
						}, null, 32)]),
						createVNode("div", { class: "form-group" }, [
							createVNode("label", { for: "aboutme" }, "О себе:"),
							withDirectives(createVNode("textarea", {
								name: "aboutme",
								id: "aboutme",
								"onUpdate:modelValue": ($event) => unref(form).aboutme = $event,
								maxlength: maxLength$1
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).aboutme]]),
							createVNode("div", { class: ["char-counter", { warning: remainingChars.value <= warningThreshold$1 }] }, [remainingChars.value <= warningThreshold$1 ? (openBlock(), createBlock("span", { key: 0 }, " Осталось " + toDisplayString(remainingChars.value) + " " + toDisplayString(pluralizeChars(remainingChars.value)), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(currentLength.value) + " / " + toDisplayString(maxLength$1), 1))], 2)
						]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Ваши навыки:"), createVNode(SkillsSelector_default, {
							skills: __props.skills,
							modelValue: unref(form).skills,
							"onUpdate:modelValue": ($event) => unref(form).skills = $event
						}, null, 8, [
							"skills",
							"modelValue",
							"onUpdate:modelValue"
						])]),
						createVNode("div", { class: "form-actions" }, [createVNode("button", {
							type: "submit",
							class: "btn-save",
							disabled: unref(form).processing
						}, toDisplayString(unref(form).processing ? "Сохранение..." : "Сохранить изменения"), 9, ["disabled"]), createVNode(unref(Link), {
							href: "/profile/" + __props.user.id,
							class: "btn-cancel"
						}, {
							default: withCtx(() => [createTextVNode(" Отмена ")]),
							_: 1
						}, 8, ["href"])])
					], 32)])])])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Edit.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var Edit_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$7, [["__scopeId", "data-v-dd22e348"]]);
//#endregion
//#region resources/js/Pages/Profile/Followers.vue
var Followers_exports = /* @__PURE__ */ __exportAll({ default: () => Followers_default });
var _sfc_main$6 = {
	__name: "Followers",
	__ssrInlineRender: true,
	props: {
		user: Object,
		followers: Object
	},
	setup(__props) {
		const page = usePage();
		const auth = computed(() => page.props.auth);
		const subscribe = (userId) => {
			router.post(`/profile/${userId}/subscribe`, {}, { preserveScroll: true });
		};
		const unsubscribe = (userId) => {
			router.delete(route("unsubscribe", userId), { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Подписчики ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="following" data-v-7e8b00a5${_scopeId}><div class="back" data-v-7e8b00a5${_scopeId}><h1 data-v-7e8b00a5${_scopeId}>Подписчики ${ssrInterpolate(__props.user.name)}</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><!--[-->`);
						ssrRenderList(__props.followers.data, (follower) => {
							_push(`<div class="user" data-v-7e8b00a5${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), { href: "/profile/" + follower.id }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img${ssrRenderAttr("src", follower.avatar ? `/storage/${follower.avatar}` : "/images/User-avatar.png")} class="author-avatar"${ssrRenderAttr("alt", `Аватар ${follower.name}`)} data-v-7e8b00a5${_scopeId}> ${ssrInterpolate(follower.name)}`);
									else return [createVNode("img", {
										src: follower.avatar ? `/storage/${follower.avatar}` : "/images/User-avatar.png",
										class: "author-avatar",
										alt: `Аватар ${follower.name}`
									}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(follower.name), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							if (auth.value.user && follower.id !== auth.value.user.id) {
								_push(`<div data-v-7e8b00a5${_scopeId}>`);
								if (follower.is_mutual) _push(ssrRenderComponent(unref(Link), { href: `/chats/start/${follower.id}` }, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`<button type="button" class="btn-message" data-v-7e8b00a5${_scopeId}>Написать сообщение</button>`);
										else return [createVNode("button", {
											type: "button",
											class: "btn-message"
										}, "Написать сообщение")];
									}),
									_: 2
								}, _parent, _scopeId));
								else if (follower.is_subscribed) _push(`<form data-v-7e8b00a5${_scopeId}><button type="submit" class="btn-unsubscribe" data-v-7e8b00a5${_scopeId}>Отписаться</button></form>`);
								else _push(`<form data-v-7e8b00a5${_scopeId}><button type="submit" class="btn-subscribe" data-v-7e8b00a5${_scopeId}>Подписаться</button></form>`);
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`</div>`);
						});
						_push(`<!--]--></div>`);
					} else return [createVNode(unref(Head), { title: `Подписчики ${__props.user.name}` }, null, 8, ["title"]), createVNode("div", { class: "following" }, [createVNode("div", { class: "back" }, [createVNode("h1", null, "Подписчики " + toDisplayString(__props.user.name), 1), createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
						default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
						_: 1
					}, 8, ["href"])]), (openBlock(true), createBlock(Fragment, null, renderList(__props.followers.data, (follower) => {
						return openBlock(), createBlock("div", {
							key: follower.id,
							class: "user"
						}, [createVNode(unref(Link), { href: "/profile/" + follower.id }, {
							default: withCtx(() => [createVNode("img", {
								src: follower.avatar ? `/storage/${follower.avatar}` : "/images/User-avatar.png",
								class: "author-avatar",
								alt: `Аватар ${follower.name}`
							}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(follower.name), 1)]),
							_: 2
						}, 1032, ["href"]), auth.value.user && follower.id !== auth.value.user.id ? (openBlock(), createBlock("div", { key: 0 }, [follower.is_mutual ? (openBlock(), createBlock(unref(Link), {
							key: 0,
							href: `/chats/start/${follower.id}`
						}, {
							default: withCtx(() => [createVNode("button", {
								type: "button",
								class: "btn-message"
							}, "Написать сообщение")]),
							_: 1
						}, 8, ["href"])) : follower.is_subscribed ? (openBlock(), createBlock("form", {
							key: 1,
							onSubmit: withModifiers(($event) => unsubscribe(follower.id), ["prevent"])
						}, [createVNode("button", {
							type: "submit",
							class: "btn-unsubscribe"
						}, "Отписаться")], 40, ["onSubmit"])) : (openBlock(), createBlock("form", {
							key: 2,
							onSubmit: withModifiers(($event) => subscribe(follower.id), ["prevent"])
						}, [createVNode("button", {
							type: "submit",
							class: "btn-subscribe"
						}, "Подписаться")], 40, ["onSubmit"]))])) : createCommentVNode("", true)]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Followers.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var Followers_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$6, [["__scopeId", "data-v-7e8b00a5"]]);
//#endregion
//#region resources/js/Pages/Profile/Following.vue
var Following_exports = /* @__PURE__ */ __exportAll({ default: () => Following_default });
var _sfc_main$5 = {
	__name: "Following",
	__ssrInlineRender: true,
	props: {
		user: Object,
		following: Object,
		subscription: Object
	},
	setup(__props) {
		const unsubscribe = (userId) => {
			router.delete(`/profile/${userId}/unsubscribe`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Подписки ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="following" data-v-d1580be8${_scopeId}><div class="back" data-v-d1580be8${_scopeId}><h1 data-v-d1580be8${_scopeId}>Подписки ${ssrInterpolate(__props.user.name)}</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><!--[-->`);
						ssrRenderList(__props.following.data, (subscription) => {
							_push(`<div class="user" data-v-d1580be8${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), { href: "/profile/" + subscription.id }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img${ssrRenderAttr("src", subscription.avatar ? `/storage/${subscription.avatar}` : "/images/User-avatar.png")} class="author-avatar"${ssrRenderAttr("alt", `Аватар ${subscription.name}`)} data-v-d1580be8${_scopeId}> ${ssrInterpolate(subscription.name)}`);
									else return [createVNode("img", {
										src: subscription.avatar ? `/storage/${subscription.avatar}` : "/images/User-avatar.png",
										class: "author-avatar",
										alt: `Аватар ${subscription.name}`
									}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(subscription.name), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							_push(`<form data-v-d1580be8${_scopeId}><button type="submit" data-v-d1580be8${_scopeId}>Отписаться</button></form></div>`);
						});
						_push(`<!--]--></div>`);
					} else return [createVNode(unref(Head), { title: `Подписки ${__props.user.name}` }, null, 8, ["title"]), createVNode("div", { class: "following" }, [createVNode("div", { class: "back" }, [createVNode("h1", null, "Подписки " + toDisplayString(__props.user.name), 1), createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
						default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
						_: 1
					}, 8, ["href"])]), (openBlock(true), createBlock(Fragment, null, renderList(__props.following.data, (subscription) => {
						return openBlock(), createBlock("div", {
							key: subscription.id,
							class: "user"
						}, [createVNode(unref(Link), { href: "/profile/" + subscription.id }, {
							default: withCtx(() => [createVNode("img", {
								src: subscription.avatar ? `/storage/${subscription.avatar}` : "/images/User-avatar.png",
								class: "author-avatar",
								alt: `Аватар ${subscription.name}`
							}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(subscription.name), 1)]),
							_: 2
						}, 1032, ["href"]), createVNode("form", { onSubmit: withModifiers(($event) => unsubscribe(subscription.id), ["prevent"]) }, [createVNode("button", { type: "submit" }, "Отписаться")], 40, ["onSubmit"])]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Following.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var Following_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$5, [["__scopeId", "data-v-d1580be8"]]);
//#endregion
//#region resources/js/Pages/Profile/LikedPosts.vue
var LikedPosts_exports = /* @__PURE__ */ __exportAll({ default: () => LikedPosts_default });
var _sfc_main$4 = {
	__name: "LikedPosts",
	__ssrInlineRender: true,
	props: {
		user: Object,
		likedPosts: Array
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Понравившиеся посты ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="likeshead" data-v-e1b4a4f3${_scopeId}><h1 data-v-e1b4a4f3${_scopeId}>Лайки ${ssrInterpolate(__props.user.name)}</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
						if (__props.likedPosts.length === 0) _push(`<h1 class="noposts" data-v-e1b4a4f3${_scopeId}> У ${ssrInterpolate(__props.user.name)} пока что нет понравившихся постов... </h1>`);
						else {
							_push(`<div class="posts" data-v-e1b4a4f3${_scopeId}><!--[-->`);
							ssrRenderList(__props.likedPosts, (like) => {
								_push(ssrRenderComponent(Post_default, {
									key: like.id,
									post: like.post,
									url: `/posts/${like.post.id}`
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						}
					} else return [
						createVNode(unref(Head), { title: `Понравившиеся посты ${__props.user.name}` }, null, 8, ["title"]),
						createVNode("div", { class: "likeshead" }, [createVNode("h1", null, "Лайки " + toDisplayString(__props.user.name), 1), createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
							_: 1
						}, 8, ["href"])]),
						__props.likedPosts.length === 0 ? (openBlock(), createBlock("h1", {
							key: 0,
							class: "noposts"
						}, " У " + toDisplayString(__props.user.name) + " пока что нет понравившихся постов... ", 1)) : (openBlock(), createBlock("div", {
							key: 1,
							class: "posts"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.likedPosts, (like) => {
							return openBlock(), createBlock(Post_default, {
								key: like.id,
								post: like.post,
								url: `/posts/${like.post.id}`
							}, null, 8, ["post", "url"]);
						}), 128))]))
					];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/LikedPosts.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var LikedPosts_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$4, [["__scopeId", "data-v-e1b4a4f3"]]);
//#endregion
//#region resources/js/Pages/Profile/Ratings.vue
var Ratings_exports = /* @__PURE__ */ __exportAll({ default: () => Ratings_default });
var _sfc_main$3 = {
	__name: "Ratings",
	__ssrInlineRender: true,
	props: {
		user: Object,
		reviews: Object,
		averageRating: [Number, String],
		reviewsCount: Number
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Рейтинг ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="ratings-page" data-v-2149f990${_scopeId}><div class="back" data-v-2149f990${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="rating-header" data-v-2149f990${_scopeId}><img${ssrRenderAttr("src", __props.user.avatar ? "/storage/" + __props.user.avatar : "/images/User-avatar.png")} class="author-avatar"${ssrRenderAttr("alt", `Аватар ${__props.user.name}`)} data-v-2149f990${_scopeId}><div class="rating-info" data-v-2149f990${_scopeId}><h1 data-v-2149f990${_scopeId}>Рейтинг ${ssrInterpolate(__props.user.name)}</h1><div class="average-rating" data-v-2149f990${_scopeId}><span class="stars" data-v-2149f990${_scopeId}>${ssrInterpolate("★".repeat(Math.round(__props.averageRating || 0)))}</span><span class="rating-number" data-v-2149f990${_scopeId}>${ssrInterpolate(__props.averageRating || "0.00")}</span><span class="reviews-count" data-v-2149f990${_scopeId}>(${ssrInterpolate(__props.reviewsCount)} отзывов)</span></div></div></div><div class="reviews-list" data-v-2149f990${_scopeId}><h2 data-v-2149f990${_scopeId}>Отзывы</h2>`);
						if (__props.reviews.length === 0) _push(`<div class="no-reviews" data-v-2149f990${_scopeId}><p data-v-2149f990${_scopeId}>Пока нет отзывов</p></div>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(__props.reviews, (review) => {
							_push(`<div class="review" data-v-2149f990${_scopeId}><div class="review-header" data-v-2149f990${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), { href: review.reviewer.profile_url }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img${ssrRenderAttr("src", review.reviewer.avatar_url ? review.reviewer.avatar_url : "/images/User-avatar.png")} class="reviewer-avatar"${ssrRenderAttr("alt", `Аватар ${review.reviewer.name}`)} data-v-2149f990${_scopeId}><span class="reviewer-name" data-v-2149f990${_scopeId}>${ssrInterpolate(review.reviewer.name)}</span>`);
									else return [createVNode("img", {
										src: review.reviewer.avatar_url ? review.reviewer.avatar_url : "/images/User-avatar.png",
										class: "reviewer-avatar",
										alt: `Аватар ${review.reviewer.name}`
									}, null, 8, ["src", "alt"]), createVNode("span", { class: "reviewer-name" }, toDisplayString(review.reviewer.name), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							_push(`<span class="review-rating" data-v-2149f990${_scopeId}>${ssrInterpolate("★".repeat(review.rating))}</span></div>`);
							if (review.comment) _push(`<p class="review-comment" data-v-2149f990${_scopeId}>${ssrInterpolate(review.comment)}</p>`);
							else _push(`<!---->`);
							_push(`<span class="review-date" data-v-2149f990${_scopeId}>${ssrInterpolate(new Date(review.created_at).toLocaleDateString("ru-RU"))}</span></div>`);
						});
						_push(`<!--]--></div></div>`);
					} else return [createVNode(unref(Head), { title: `Рейтинг ${__props.user.name}` }, null, 8, ["title"]), createVNode("div", { class: "ratings-page" }, [
						createVNode("div", { class: "back" }, [createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
							_: 1
						}, 8, ["href"])]),
						createVNode("div", { class: "rating-header" }, [createVNode("img", {
							src: __props.user.avatar ? "/storage/" + __props.user.avatar : "/images/User-avatar.png",
							class: "author-avatar",
							alt: `Аватар ${__props.user.name}`
						}, null, 8, ["src", "alt"]), createVNode("div", { class: "rating-info" }, [createVNode("h1", null, "Рейтинг " + toDisplayString(__props.user.name), 1), createVNode("div", { class: "average-rating" }, [
							createVNode("span", { class: "stars" }, toDisplayString("★".repeat(Math.round(__props.averageRating || 0))), 1),
							createVNode("span", { class: "rating-number" }, toDisplayString(__props.averageRating || "0.00"), 1),
							createVNode("span", { class: "reviews-count" }, "(" + toDisplayString(__props.reviewsCount) + " отзывов)", 1)
						])])]),
						createVNode("div", { class: "reviews-list" }, [
							createVNode("h2", null, "Отзывы"),
							__props.reviews.length === 0 ? (openBlock(), createBlock("div", {
								key: 0,
								class: "no-reviews"
							}, [createVNode("p", null, "Пока нет отзывов")])) : createCommentVNode("", true),
							(openBlock(true), createBlock(Fragment, null, renderList(__props.reviews, (review) => {
								return openBlock(), createBlock("div", {
									key: review.id,
									class: "review"
								}, [
									createVNode("div", { class: "review-header" }, [createVNode(unref(Link), { href: review.reviewer.profile_url }, {
										default: withCtx(() => [createVNode("img", {
											src: review.reviewer.avatar_url ? review.reviewer.avatar_url : "/images/User-avatar.png",
											class: "reviewer-avatar",
											alt: `Аватар ${review.reviewer.name}`
										}, null, 8, ["src", "alt"]), createVNode("span", { class: "reviewer-name" }, toDisplayString(review.reviewer.name), 1)]),
										_: 2
									}, 1032, ["href"]), createVNode("span", { class: "review-rating" }, toDisplayString("★".repeat(review.rating)), 1)]),
									review.comment ? (openBlock(), createBlock("p", {
										key: 0,
										class: "review-comment"
									}, toDisplayString(review.comment), 1)) : createCommentVNode("", true),
									createVNode("span", { class: "review-date" }, toDisplayString(new Date(review.created_at).toLocaleDateString("ru-RU")), 1)
								]);
							}), 128))
						])
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Ratings.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var Ratings_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$3, [["__scopeId", "data-v-2149f990"]]);
//#endregion
//#region resources/js/Pages/Profile/Show.vue
var Show_exports = /* @__PURE__ */ __exportAll({ default: () => Show_default });
var _sfc_main$2 = {
	__name: "Show",
	__ssrInlineRender: true,
	props: {
		user: Object,
		posts: Object,
		auth: Object
	},
	setup(__props) {
		const props = __props;
		const page = usePage();
		const auth = computed(() => page.props.auth);
		const isOwnProfile = computed(() => auth.value.user && auth.value.user.id === props.user.id);
		const aboutmeText = ref(null);
		const aboutmeContent = ref(null);
		const showExpandButton = ref(false);
		const isExpanded = ref(false);
		const expandedHeight = ref("15em");
		const checkTextHeight = () => {
			if (aboutmeText.value) {
				const lineHeight = parseFloat(getComputedStyle(aboutmeText.value).lineHeight);
				showExpandButton.value = aboutmeText.value.scrollHeight > lineHeight * 15;
			}
		};
		const toggleExpand = () => {
			if (!isExpanded.value) expandedHeight.value = aboutmeText.value.scrollHeight + "px";
			else expandedHeight.value = "15em";
			isExpanded.value = !isExpanded.value;
		};
		onMounted(() => {
			nextTick(() => {
				checkTextHeight();
			});
		});
		const aboutMeForm = useForm({ aboutme: props.user.aboutme || "" });
		const submitAboutMe = () => {
			aboutMeForm.put(route("profile.update-aboutme", props.user.username), {
				preserveScroll: true,
				onSuccess: () => {
					nextTick(() => {
						checkTextHeight();
					});
				}
			});
		};
		useForm({ avatar: null });
		const toggleSubscription = () => {
			if (!props.auth?.user) {
				router.visit("/login");
				return;
			}
			if (!props.user?.id) {
				console.error("ID пользователя не найден в props.user");
				return;
			}
			const url = `/profile/${props.user.id}/${props.user.is_subscribed ? "unsubscribe" : "subscribe"}`;
			router[props.user.is_subscribed ? "delete" : "post"](url, {}, {
				preserveScroll: true,
				preserveState: true
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Профиль " + __props.user.name }, null, _parent, _scopeId));
						_push(`<div class="Profileblock" data-v-db7cc223${_scopeId}><div class="container" data-v-db7cc223${_scopeId}><div class="avatar" data-v-db7cc223${_scopeId}><div class="profile-header" data-v-db7cc223${_scopeId}>`);
						if (__props.user.avatar_url) _push(`<img${ssrRenderAttr("src", __props.user.avatar_url)}${ssrRenderAttr("alt", "Аватарка " + __props.user.name)} data-v-db7cc223${_scopeId}>`);
						else _push(`<img src="/images/User-avatar.png"${ssrRenderAttr("alt", "Аватарка " + __props.user.name)} data-v-db7cc223${_scopeId}>`);
						_push(`</div><div class="desc" data-v-db7cc223${_scopeId}><h1 data-v-db7cc223${_scopeId}>${ssrInterpolate(__props.user.name)}</h1>`);
						if (__props.user.is_verified === "verified") _push(`<img src="/images/verified.svg" alt="Аккаунт верифицирован" data-v-db7cc223${_scopeId}>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (__props.user.rating) {
							_push(`<div class="rating-display" data-v-db7cc223${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), {
								href: "/ratings/" + __props.user.id,
								class: "rating-link"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) {
										_push(`<div class="stars" data-v-db7cc223${_scopeId}><!--[-->`);
										ssrRenderList(5, (i) => {
											_push(`<!--[-->`);
											if (i <= Math.floor(__props.user.rating)) _push(`<img src="/images/star.svg" alt="star" class="star-icon" data-v-db7cc223${_scopeId}>`);
											else if (i - 1 < __props.user.rating && __props.user.rating % 1 >= .5) _push(`<img src="/images/star.svg" alt="half-star" class="star-icon half" data-v-db7cc223${_scopeId}>`);
											else _push(`<img src="/images/star-empty.svg" alt="star-empty" class="star-icon empty" data-v-db7cc223${_scopeId}>`);
											_push(`<!--]-->`);
										});
										_push(`<!--]--></div><span class="rating-value" data-v-db7cc223${_scopeId}>${ssrInterpolate(__props.user.rating)}</span>`);
									} else return [createVNode("div", { class: "stars" }, [(openBlock(), createBlock(Fragment, null, renderList(5, (i) => {
										return openBlock(), createBlock(Fragment, { key: i }, [i <= Math.floor(__props.user.rating) ? (openBlock(), createBlock("img", {
											key: 0,
											src: "/images/star.svg",
											alt: "star",
											class: "star-icon"
										})) : i - 1 < __props.user.rating && __props.user.rating % 1 >= .5 ? (openBlock(), createBlock("img", {
											key: 1,
											src: "/images/star.svg",
											alt: "half-star",
											class: "star-icon half"
										})) : (openBlock(), createBlock("img", {
											key: 2,
											src: "/images/star-empty.svg",
											alt: "star-empty",
											class: "star-icon empty"
										}))], 64);
									}), 64))]), createVNode("span", { class: "rating-value" }, toDisplayString(__props.user.rating), 1)];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div>`);
						} else _push(`<!---->`);
						if (__props.user.created_at) _push(`<p class="created-at" data-v-db7cc223${_scopeId}>Аккаунт создан ${ssrInterpolate(__props.user.created_at)}</p>`);
						else _push(`<!---->`);
						_push(`</div></div><div class="aboutme" data-v-db7cc223${_scopeId}><div class="aboutme-header" data-v-db7cc223${_scopeId}><h1 data-v-db7cc223${_scopeId}>Обо мне</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id + "/following" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Подписки<br data-v-db7cc223${_scopeId}> ${ssrInterpolate(__props.user.following_count)}`);
								else return [
									createTextVNode(" Подписки"),
									createVNode("br"),
									createTextVNode(" " + toDisplayString(__props.user.following_count), 1)
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id + "/followers" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Подписчики<br data-v-db7cc223${_scopeId}> ${ssrInterpolate(__props.user.followers_count)}`);
								else return [
									createTextVNode(" Подписчики"),
									createVNode("br"),
									createTextVNode(" " + toDisplayString(__props.user.followers_count), 1)
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id + "/liked-posts" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Лайки`);
								else return [createTextVNode("Лайки")];
							}),
							_: 1
						}, _parent, _scopeId));
						if (isOwnProfile.value) _push(ssrRenderComponent(unref(Link), {
							href: "/settings",
							class: "btn-edit"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<img src="/images/settings.png" alt="Редактировать профиль" data-v-db7cc223${_scopeId}>`);
								else return [createVNode("img", {
									src: "/images/settings.png",
									alt: "Редактировать профиль"
								})];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
						_push(`</div>`);
						if (isOwnProfile.value) {
							_push(`<div data-v-db7cc223${_scopeId}>`);
							if (!__props.user.aboutme) _push(`<div class="aboutme-form" data-v-db7cc223${_scopeId}><p data-v-db7cc223${_scopeId}>Расскажите о себе</p><form data-v-db7cc223${_scopeId}><textarea draggable="false" placeholder="Напишите что-нибудь о себе..." data-v-db7cc223${_scopeId}>${ssrInterpolate(unref(aboutMeForm).aboutme)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(aboutMeForm).processing) ? " disabled" : ""} data-v-db7cc223${_scopeId}>Сохранить</button></form></div>`);
							else _push(`<div class="${ssrRenderClass([{ expanded: isExpanded.value }, "aboutme-content"])}" style="${ssrRenderStyle({ maxHeight: expandedHeight.value })}" data-v-db7cc223${_scopeId}><p data-v-db7cc223${_scopeId}>${ssrInterpolate(__props.user.aboutme)}</p></div>`);
							_push(`</div>`);
						} else _push(`<div class="aboutme-body" data-v-db7cc223${_scopeId}><div class="${ssrRenderClass([{ expanded: isExpanded.value }, "aboutme-content"])}" style="${ssrRenderStyle({ maxHeight: expandedHeight.value })}" data-v-db7cc223${_scopeId}><p class="truncated-text" data-v-db7cc223${_scopeId}>${ssrInterpolate(__props.user.aboutme || "Пользователь пока не добавил информацию о себе.")}</p></div></div>`);
						if (showExpandButton.value) _push(`<div class="expand" data-v-db7cc223${_scopeId}>${ssrInterpolate(isExpanded.value ? "Свернуть" : "Развернуть")}</div>`);
						else _push(`<!---->`);
						if (__props.user.skills && __props.user.skills.length > 0) {
							_push(`<div class="user-skills" data-v-db7cc223${_scopeId}><h3 data-v-db7cc223${_scopeId}>Навыки</h3><div class="skills-list" data-v-db7cc223${_scopeId}><!--[-->`);
							ssrRenderList(__props.user.skills, (skill) => {
								_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-db7cc223${_scopeId}><span class="skill-name" data-v-db7cc223${_scopeId}>${ssrInterpolate(skill.name)}</span><span class="skill-level" data-v-db7cc223${_scopeId}>★ ${ssrInterpolate(skill.level)}</span></div>`);
							});
							_push(`<!--]--></div></div>`);
						} else _push(`<!---->`);
						if (!isOwnProfile.value && auth.value.user) {
							_push(`<div class="profile-actions" data-v-db7cc223${_scopeId}><form data-v-db7cc223${_scopeId}><button type="submit" data-v-db7cc223${_scopeId}>${ssrInterpolate(__props.user.is_subscribed ? "Отписаться" : "Подписаться")}</button></form>`);
							_push(ssrRenderComponent(unref(Link), { href: "/chats/start/" + __props.user.id }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<button data-v-db7cc223${_scopeId}>Написать сообщение</button>`);
									else return [createVNode("button", null, "Написать сообщение")];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div></div><h2 data-v-db7cc223${_scopeId}>Посты ${ssrInterpolate(__props.user.name)}</h2>`);
						if (__props.posts.length > 0 || isOwnProfile.value) {
							_push(`<div class="posts" data-v-db7cc223${_scopeId}>`);
							if (isOwnProfile.value) {
								_push(`<div class="post add-post-block" data-v-db7cc223${_scopeId}>`);
								_push(ssrRenderComponent(unref(Link), {
									href: "/posts/create",
									class: "add-post-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`<p data-v-db7cc223${_scopeId}>Добавить новый пост</p><button class="add-post-button" data-v-db7cc223${_scopeId}>+</button>`);
										else return [createVNode("p", null, "Добавить новый пост"), createVNode("button", { class: "add-post-button" }, "+")];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`<!--[-->`);
							ssrRenderList(__props.posts, (post) => {
								_push(ssrRenderComponent(Post_default, {
									key: post.id,
									post
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						} else _push(`<div class="noposts" data-v-db7cc223${_scopeId}><h1 data-v-db7cc223${_scopeId}>у ${ssrInterpolate(__props.user.name)} пока что нет постов...</h1></div>`);
					} else return [
						createVNode(unref(Head), { title: "Профиль " + __props.user.name }, null, 8, ["title"]),
						createVNode("div", { class: "Profileblock" }, [createVNode("div", { class: "container" }, [createVNode("div", { class: "avatar" }, [
							createVNode("div", { class: "profile-header" }, [__props.user.avatar_url ? (openBlock(), createBlock("img", {
								key: 0,
								src: __props.user.avatar_url,
								alt: "Аватарка " + __props.user.name
							}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
								key: 1,
								src: "/images/User-avatar.png",
								alt: "Аватарка " + __props.user.name
							}, null, 8, ["alt"]))]),
							createVNode("div", { class: "desc" }, [createVNode("h1", null, toDisplayString(__props.user.name), 1), __props.user.is_verified === "verified" ? (openBlock(), createBlock("img", {
								key: 0,
								src: "/images/verified.svg",
								alt: "Аккаунт верифицирован"
							})) : createCommentVNode("", true)]),
							__props.user.rating ? (openBlock(), createBlock("div", {
								key: 0,
								class: "rating-display"
							}, [createVNode(unref(Link), {
								href: "/ratings/" + __props.user.id,
								class: "rating-link"
							}, {
								default: withCtx(() => [createVNode("div", { class: "stars" }, [(openBlock(), createBlock(Fragment, null, renderList(5, (i) => {
									return openBlock(), createBlock(Fragment, { key: i }, [i <= Math.floor(__props.user.rating) ? (openBlock(), createBlock("img", {
										key: 0,
										src: "/images/star.svg",
										alt: "star",
										class: "star-icon"
									})) : i - 1 < __props.user.rating && __props.user.rating % 1 >= .5 ? (openBlock(), createBlock("img", {
										key: 1,
										src: "/images/star.svg",
										alt: "half-star",
										class: "star-icon half"
									})) : (openBlock(), createBlock("img", {
										key: 2,
										src: "/images/star-empty.svg",
										alt: "star-empty",
										class: "star-icon empty"
									}))], 64);
								}), 64))]), createVNode("span", { class: "rating-value" }, toDisplayString(__props.user.rating), 1)]),
								_: 1
							}, 8, ["href"])])) : createCommentVNode("", true),
							__props.user.created_at ? (openBlock(), createBlock("p", {
								key: 1,
								class: "created-at"
							}, "Аккаунт создан " + toDisplayString(__props.user.created_at), 1)) : createCommentVNode("", true)
						])]), createVNode("div", { class: "aboutme" }, [
							createVNode("div", { class: "aboutme-header" }, [
								createVNode("h1", null, "Обо мне"),
								createVNode(unref(Link), { href: "/profile/" + __props.user.id + "/following" }, {
									default: withCtx(() => [
										createTextVNode(" Подписки"),
										createVNode("br"),
										createTextVNode(" " + toDisplayString(__props.user.following_count), 1)
									]),
									_: 1
								}, 8, ["href"]),
								createVNode(unref(Link), { href: "/profile/" + __props.user.id + "/followers" }, {
									default: withCtx(() => [
										createTextVNode(" Подписчики"),
										createVNode("br"),
										createTextVNode(" " + toDisplayString(__props.user.followers_count), 1)
									]),
									_: 1
								}, 8, ["href"]),
								createVNode(unref(Link), { href: "/profile/" + __props.user.id + "/liked-posts" }, {
									default: withCtx(() => [createTextVNode("Лайки")]),
									_: 1
								}, 8, ["href"]),
								isOwnProfile.value ? (openBlock(), createBlock(unref(Link), {
									key: 0,
									href: "/settings",
									class: "btn-edit"
								}, {
									default: withCtx(() => [createVNode("img", {
										src: "/images/settings.png",
										alt: "Редактировать профиль"
									})]),
									_: 1
								})) : createCommentVNode("", true)
							]),
							isOwnProfile.value ? (openBlock(), createBlock("div", { key: 0 }, [!__props.user.aboutme ? (openBlock(), createBlock("div", {
								key: 0,
								class: "aboutme-form"
							}, [createVNode("p", null, "Расскажите о себе"), createVNode("form", { onSubmit: withModifiers(submitAboutMe, ["prevent"]) }, [withDirectives(createVNode("textarea", {
								draggable: "false",
								"onUpdate:modelValue": ($event) => unref(aboutMeForm).aboutme = $event,
								placeholder: "Напишите что-нибудь о себе..."
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(aboutMeForm).aboutme]]), createVNode("button", {
								type: "submit",
								disabled: unref(aboutMeForm).processing
							}, "Сохранить", 8, ["disabled"])], 32)])) : (openBlock(), createBlock("div", {
								key: 1,
								class: ["aboutme-content", { expanded: isExpanded.value }],
								style: { maxHeight: expandedHeight.value },
								ref_key: "aboutmeContent",
								ref: aboutmeContent
							}, [createVNode("p", {
								ref_key: "aboutmeText",
								ref: aboutmeText
							}, toDisplayString(__props.user.aboutme), 513)], 6))])) : (openBlock(), createBlock("div", {
								key: 1,
								class: "aboutme-body"
							}, [createVNode("div", {
								class: ["aboutme-content", { expanded: isExpanded.value }],
								style: { maxHeight: expandedHeight.value },
								ref_key: "aboutmeContent",
								ref: aboutmeContent
							}, [createVNode("p", {
								class: "truncated-text",
								ref_key: "aboutmeText",
								ref: aboutmeText
							}, toDisplayString(__props.user.aboutme || "Пользователь пока не добавил информацию о себе."), 513)], 6)])),
							showExpandButton.value ? (openBlock(), createBlock("div", {
								key: 2,
								onClick: toggleExpand,
								class: "expand"
							}, toDisplayString(isExpanded.value ? "Свернуть" : "Развернуть"), 1)) : createCommentVNode("", true),
							__props.user.skills && __props.user.skills.length > 0 ? (openBlock(), createBlock("div", {
								key: 3,
								class: "user-skills"
							}, [createVNode("h3", null, "Навыки"), createVNode("div", { class: "skills-list" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.user.skills, (skill) => {
								return openBlock(), createBlock("div", {
									key: skill.id,
									class: ["skill-tag", unref(getSkillClass)(skill.name)]
								}, [createVNode("span", { class: "skill-name" }, toDisplayString(skill.name), 1), createVNode("span", { class: "skill-level" }, "★ " + toDisplayString(skill.level), 1)], 2);
							}), 128))])])) : createCommentVNode("", true),
							!isOwnProfile.value && auth.value.user ? (openBlock(), createBlock("div", {
								key: 4,
								class: "profile-actions"
							}, [createVNode("form", { onSubmit: withModifiers(toggleSubscription, ["prevent"]) }, [createVNode("button", { type: "submit" }, toDisplayString(__props.user.is_subscribed ? "Отписаться" : "Подписаться"), 1)], 32), createVNode(unref(Link), { href: "/chats/start/" + __props.user.id }, {
								default: withCtx(() => [createVNode("button", null, "Написать сообщение")]),
								_: 1
							}, 8, ["href"])])) : createCommentVNode("", true)
						])]),
						createVNode("h2", null, "Посты " + toDisplayString(__props.user.name), 1),
						__props.posts.length > 0 || isOwnProfile.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "posts"
						}, [isOwnProfile.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "post add-post-block"
						}, [createVNode(unref(Link), {
							href: "/posts/create",
							class: "add-post-link"
						}, {
							default: withCtx(() => [createVNode("p", null, "Добавить новый пост"), createVNode("button", { class: "add-post-button" }, "+")]),
							_: 1
						})])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(__props.posts, (post) => {
							return openBlock(), createBlock(Post_default, {
								key: post.id,
								post
							}, null, 8, ["post"]);
						}), 128))])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "noposts"
						}, [createVNode("h1", null, "у " + toDisplayString(__props.user.name) + " пока что нет постов...", 1)]))
					];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Show.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var Show_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$2, [["__scopeId", "data-v-db7cc223"]]);
//#endregion
//#region resources/js/Pages/Settings/Index.vue
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => Index_default });
var maxLength = 1e3;
var warningThreshold = 50;
var _sfc_main$1 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		section: String,
		user: Object,
		skills: {
			type: Array,
			default: () => []
		},
		userSkills: {
			type: Array,
			default: () => []
		},
		userFiles: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const avatarPreview = ref(null);
		const fileInputRef = ref(null);
		const isDragging = ref(false);
		const requestVerification = () => {
			axios.post("/settings/request-verification").then((response) => {
				window.location.reload();
			}).catch((error) => {
				alert(error.response?.data?.error || "Error");
			});
		};
		const resendEmailVerification = () => {
			axios.post("/settings/resend-email-verification").then((response) => {
				alert("Email отправлен! Проверьте почту (mailhog на порту 8025)");
			}).catch((error) => {
				alert(error.response?.data?.error || "Error");
			});
		};
		const form = useForm({
			name: props.user.name,
			aboutme: props.user.aboutme || "",
			avatar: null,
			skills: props.userSkills || [],
			_method: "PUT"
		});
		const currentLength = computed(() => (form.aboutme || "").length);
		const remainingChars = computed(() => maxLength - currentLength.value);
		const pluralizeChars = (count) => {
			if (count === 1) return "символ";
			if (count >= 2 && count <= 4) return "символа";
			return "символов";
		};
		const handleAreaClick = () => {
			fileInputRef.value.click();
		};
		const handleFileSelect = (e) => {
			const file = e.target.files[0];
			if (file) processFile(file);
		};
		const handleDragOver = () => {
			isDragging.value = true;
		};
		const handleDragLeave = () => {
			isDragging.value = false;
		};
		const handleDrop = (e) => {
			isDragging.value = false;
			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith("image/")) processFile(file);
		};
		const processFile = (file) => {
			form.avatar = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview.value = e.target.result;
			};
			reader.readAsDataURL(file);
		};
		function submit() {
			if (!form.avatar) form.transform((data) => {
				delete data.avatar;
				return data;
			});
			form.post(`/profile/${props.user.id}`, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					if (form.avatar) {
						form.reset("avatar");
						avatarPreview.value = null;
					}
				}
			});
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="settings-container" data-v-4c6c7fd3${_scopeId}><div class="settings-header" data-v-4c6c7fd3${_scopeId}><h1 data-v-4c6c7fd3${_scopeId}>Настройки</h1></div><div class="settings-content" data-v-4c6c7fd3${_scopeId}><nav class="settings-nav" data-v-4c6c7fd3${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/settings/profile",
							class: ["settings-nav-item", { active: __props.section === "profile" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Профиль `);
								else return [createTextVNode(" Профиль ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/settings/privacy",
							class: ["settings-nav-item", { active: __props.section === "privacy" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Приватность `);
								else return [createTextVNode(" Приватность ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/settings/files",
							class: ["settings-nav-item", { active: __props.section === "files" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Мои Файлы `);
								else return [createTextVNode(" Мои Файлы ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</nav><div class="settings-panel" data-v-4c6c7fd3${_scopeId}>`);
						if (__props.section === "profile") {
							_push(`<div class="panel-profile" data-v-4c6c7fd3${_scopeId}><div class="edit-content" data-v-4c6c7fd3${_scopeId}><div class="avatar" data-v-4c6c7fd3${_scopeId}><div class="profile-header avatar-upload" data-v-4c6c7fd3${_scopeId}><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-4c6c7fd3${_scopeId}>`);
							if (avatarPreview.value || __props.user.avatar) _push(`<img${ssrRenderAttr("src", avatarPreview.value || "/storage/" + __props.user.avatar)} class="avatar-preview" data-v-4c6c7fd3${_scopeId}>`);
							else _push(`<div class="no-avatar" data-v-4c6c7fd3${_scopeId}><span data-v-4c6c7fd3${_scopeId}>Нажмите для загрузки</span></div>`);
							if (avatarPreview.value || __props.user.avatar) _push(`<div class="avatar-overlay" data-v-4c6c7fd3${_scopeId}><button type="button" class="change-avatar-btn" data-v-4c6c7fd3${_scopeId}> Изменить фото </button></div>`);
							else _push(`<!---->`);
							_push(`</div>`);
							if (!__props.user.is_verified || __props.user.is_verified !== "verified") {
								_push(`<div class="verification-links" data-v-4c6c7fd3${_scopeId}>`);
								if (!__props.user.is_verified || __props.user.is_verified === "rejected") _push(ssrRenderComponent(unref(Link), {
									href: "#",
									onClick: requestVerification,
									class: "verification-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Запросить верификацию `);
										else return [createTextVNode(" Запросить верификацию ")];
									}),
									_: 1
								}, _parent, _scopeId));
								else _push(`<!---->`);
								if (!__props.user.email_verified_at) _push(ssrRenderComponent(unref(Link), {
									href: "#",
									onClick: resendEmailVerification,
									class: "verification-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Подтвердить почту `);
										else return [createTextVNode(" Подтвердить почту ")];
									}),
									_: 1
								}, _parent, _scopeId));
								else _push(`<!---->`);
								if (__props.user.is_verified === "pending") _push(`<p class="verification-status" data-v-4c6c7fd3${_scopeId}> Заявка на верификацию на рассмотрении </p>`);
								else _push(`<!---->`);
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`</div><div class="desc" data-v-4c6c7fd3${_scopeId}><form enctype="multipart/form-data" data-v-4c6c7fd3${_scopeId}><div class="form-group" data-v-4c6c7fd3${_scopeId}><label for="name" data-v-4c6c7fd3${_scopeId}>Имя:</label><input type="text" name="name" id="name"${ssrRenderAttr("value", unref(form).name)} required data-v-4c6c7fd3${_scopeId}></div><div class="form-group" data-v-4c6c7fd3${_scopeId}><label for="aboutme" data-v-4c6c7fd3${_scopeId}>О себе:</label><textarea name="aboutme" id="aboutme"${ssrRenderAttr("maxlength", maxLength)} data-v-4c6c7fd3${_scopeId}>${ssrInterpolate(unref(form).aboutme)}</textarea><div class="${ssrRenderClass([{ warning: remainingChars.value <= warningThreshold }, "char-counter"])}" data-v-4c6c7fd3${_scopeId}>`);
							if (remainingChars.value <= warningThreshold) _push(`<span data-v-4c6c7fd3${_scopeId}> Осталось ${ssrInterpolate(remainingChars.value)} ${ssrInterpolate(pluralizeChars(remainingChars.value))}</span>`);
							else _push(`<span data-v-4c6c7fd3${_scopeId}>${ssrInterpolate(currentLength.value)} / ${ssrInterpolate(maxLength)}</span>`);
							_push(`</div></div><div class="form-group" data-v-4c6c7fd3${_scopeId}><label data-v-4c6c7fd3${_scopeId}>Ваши навыки:</label>`);
							_push(ssrRenderComponent(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, _parent, _scopeId));
							_push(`</div><div class="form-actions" data-v-4c6c7fd3${_scopeId}><button type="submit" class="btn-save"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-4c6c7fd3${_scopeId}>${ssrInterpolate(unref(form).processing ? "Сохранение..." : "Сохранить изменения")}</button>`);
							_push(ssrRenderComponent(unref(Link), {
								href: "/profile/" + __props.user.id,
								class: "btn-cancel"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(` Отмена `);
									else return [createTextVNode(" Отмена ")];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div></form></div></div></div>`);
						} else if (__props.section === "privacy") _push(`<div class="panel-privacy" data-v-4c6c7fd3${_scopeId}><h2 data-v-4c6c7fd3${_scopeId}>Настройки приватности</h2><p class="coming-soon" data-v-4c6c7fd3${_scopeId}>Раздел в разработке</p></div>`);
						else if (__props.section === "files") {
							_push(`<div class="panel-files" data-v-4c6c7fd3${_scopeId}><h2 data-v-4c6c7fd3${_scopeId}>Ваши файлы</h2>`);
							if (__props.userFiles && __props.userFiles.length > 0) {
								_push(`<div class="files-list" data-v-4c6c7fd3${_scopeId}><!--[-->`);
								ssrRenderList(__props.userFiles, (file) => {
									_push(`<div class="file-item" data-v-4c6c7fd3${_scopeId}><div class="file-info" data-v-4c6c7fd3${_scopeId}><span class="file-icon" data-v-4c6c7fd3${_scopeId}>📄</span><span class="file-name" data-v-4c6c7fd3${_scopeId}>${ssrInterpolate(file.name)}</span></div><div class="file-actions" data-v-4c6c7fd3${_scopeId}><a${ssrRenderAttr("href", file.url)} target="_blank" class="file-view-btn" data-v-4c6c7fd3${_scopeId}>Просмотр</a></div></div>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<div class="no-files" data-v-4c6c7fd3${_scopeId}><p data-v-4c6c7fd3${_scopeId}>У вас пока нет загруженных файлов</p><p class="no-files-hint" data-v-4c6c7fd3${_scopeId}>Файлы можно загрузить при регистрации или редактировании профиля</p></div>`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div></div></div>`);
					} else return [createVNode("div", { class: "settings-container" }, [createVNode("div", { class: "settings-header" }, [createVNode("h1", null, "Настройки")]), createVNode("div", { class: "settings-content" }, [createVNode("nav", { class: "settings-nav" }, [
						createVNode(unref(Link), {
							href: "/settings/profile",
							class: ["settings-nav-item", { active: __props.section === "profile" }]
						}, {
							default: withCtx(() => [createTextVNode(" Профиль ")]),
							_: 1
						}, 8, ["class"]),
						createVNode(unref(Link), {
							href: "/settings/privacy",
							class: ["settings-nav-item", { active: __props.section === "privacy" }]
						}, {
							default: withCtx(() => [createTextVNode(" Приватность ")]),
							_: 1
						}, 8, ["class"]),
						createVNode(unref(Link), {
							href: "/settings/files",
							class: ["settings-nav-item", { active: __props.section === "files" }]
						}, {
							default: withCtx(() => [createTextVNode(" Мои Файлы ")]),
							_: 1
						}, 8, ["class"])
					]), createVNode("div", { class: "settings-panel" }, [__props.section === "profile" ? (openBlock(), createBlock("div", {
						key: 0,
						class: "panel-profile"
					}, [createVNode("div", { class: "edit-content" }, [createVNode("div", { class: "avatar" }, [createVNode("div", {
						class: "profile-header avatar-upload",
						onClick: handleAreaClick,
						onDragover: withModifiers(handleDragOver, ["prevent"]),
						onDragleave: handleDragLeave,
						onDrop: withModifiers(handleDrop, ["prevent"])
					}, [
						createVNode("input", {
							type: "file",
							ref_key: "fileInputRef",
							ref: fileInputRef,
							accept: "image/*",
							style: { "display": "none" },
							onChange: handleFileSelect
						}, null, 544),
						avatarPreview.value || __props.user.avatar ? (openBlock(), createBlock("img", {
							key: 0,
							src: avatarPreview.value || "/storage/" + __props.user.avatar,
							class: "avatar-preview"
						}, null, 8, ["src"])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "no-avatar"
						}, [createVNode("span", null, "Нажмите для загрузки")])),
						avatarPreview.value || __props.user.avatar ? (openBlock(), createBlock("div", {
							key: 2,
							class: "avatar-overlay"
						}, [createVNode("button", {
							type: "button",
							onClick: withModifiers(handleAreaClick, ["stop"]),
							class: "change-avatar-btn"
						}, " Изменить фото ")])) : createCommentVNode("", true)
					], 32), !__props.user.is_verified || __props.user.is_verified !== "verified" ? (openBlock(), createBlock("div", {
						key: 0,
						class: "verification-links"
					}, [
						!__props.user.is_verified || __props.user.is_verified === "rejected" ? (openBlock(), createBlock(unref(Link), {
							key: 0,
							href: "#",
							onClick: withModifiers(requestVerification, ["prevent"]),
							class: "verification-link"
						}, {
							default: withCtx(() => [createTextVNode(" Запросить верификацию ")]),
							_: 1
						})) : createCommentVNode("", true),
						!__props.user.email_verified_at ? (openBlock(), createBlock(unref(Link), {
							key: 1,
							href: "#",
							onClick: withModifiers(resendEmailVerification, ["prevent"]),
							class: "verification-link"
						}, {
							default: withCtx(() => [createTextVNode(" Подтвердить почту ")]),
							_: 1
						})) : createCommentVNode("", true),
						__props.user.is_verified === "pending" ? (openBlock(), createBlock("p", {
							key: 2,
							class: "verification-status"
						}, " Заявка на верификацию на рассмотрении ")) : createCommentVNode("", true)
					])) : createCommentVNode("", true)]), createVNode("div", { class: "desc" }, [createVNode("form", {
						onSubmit: withModifiers(submit, ["prevent"]),
						enctype: "multipart/form-data"
					}, [
						createVNode("div", { class: "form-group" }, [createVNode("label", { for: "name" }, "Имя:"), withDirectives(createVNode("input", {
							type: "text",
							name: "name",
							id: "name",
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							required: ""
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).name]])]),
						createVNode("div", { class: "form-group" }, [
							createVNode("label", { for: "aboutme" }, "О себе:"),
							withDirectives(createVNode("textarea", {
								name: "aboutme",
								id: "aboutme",
								"onUpdate:modelValue": ($event) => unref(form).aboutme = $event,
								maxlength: maxLength
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).aboutme]]),
							createVNode("div", { class: ["char-counter", { warning: remainingChars.value <= warningThreshold }] }, [remainingChars.value <= warningThreshold ? (openBlock(), createBlock("span", { key: 0 }, " Осталось " + toDisplayString(remainingChars.value) + " " + toDisplayString(pluralizeChars(remainingChars.value)), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(currentLength.value) + " / " + toDisplayString(maxLength), 1))], 2)
						]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Ваши навыки:"), createVNode(SkillsSelector_default, {
							skills: __props.skills,
							modelValue: unref(form).skills,
							"onUpdate:modelValue": ($event) => unref(form).skills = $event
						}, null, 8, [
							"skills",
							"modelValue",
							"onUpdate:modelValue"
						])]),
						createVNode("div", { class: "form-actions" }, [createVNode("button", {
							type: "submit",
							class: "btn-save",
							disabled: unref(form).processing
						}, toDisplayString(unref(form).processing ? "Сохранение..." : "Сохранить изменения"), 9, ["disabled"]), createVNode(unref(Link), {
							href: "/profile/" + __props.user.id,
							class: "btn-cancel"
						}, {
							default: withCtx(() => [createTextVNode(" Отмена ")]),
							_: 1
						}, 8, ["href"])])
					], 32)])])])) : __props.section === "privacy" ? (openBlock(), createBlock("div", {
						key: 1,
						class: "panel-privacy"
					}, [createVNode("h2", null, "Настройки приватности"), createVNode("p", { class: "coming-soon" }, "Раздел в разработке")])) : __props.section === "files" ? (openBlock(), createBlock("div", {
						key: 2,
						class: "panel-files"
					}, [createVNode("h2", null, "Ваши файлы"), __props.userFiles && __props.userFiles.length > 0 ? (openBlock(), createBlock("div", {
						key: 0,
						class: "files-list"
					}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.userFiles, (file) => {
						return openBlock(), createBlock("div", {
							key: file.type,
							class: "file-item"
						}, [createVNode("div", { class: "file-info" }, [createVNode("span", { class: "file-icon" }, "📄"), createVNode("span", { class: "file-name" }, toDisplayString(file.name), 1)]), createVNode("div", { class: "file-actions" }, [createVNode("a", {
							href: file.url,
							target: "_blank",
							class: "file-view-btn"
						}, "Просмотр", 8, ["href"])])]);
					}), 128))])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "no-files"
					}, [createVNode("p", null, "У вас пока нет загруженных файлов"), createVNode("p", { class: "no-files-hint" }, "Файлы можно загрузить при регистрации или редактировании профиля")]))])) : createCommentVNode("", true)])])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Index.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var Index_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$1, [["__scopeId", "data-v-4c6c7fd3"]]);
//#endregion
//#region resources/js/Pages/Settings/Notifications.vue
var Notifications_exports = /* @__PURE__ */ __exportAll({ default: () => Notifications_default });
var _sfc_main = {
	__name: "Notifications",
	__ssrInlineRender: true,
	props: {
		notifications: {
			type: Array,
			default: () => []
		},
		unreadCount: {
			type: Number,
			default: 0
		}
	},
	setup(__props) {
		const props = __props;
		const notifications = ref([...props.notifications]);
		const unreadCount = ref(props.unreadCount);
		const handleNotificationClick = async (notification) => {
			if (!notification.is_read) try {
				await axios$1.post("/notifications/mark-read", { id: notification.id });
				notification.is_read = true;
				unreadCount.value = Math.max(0, unreadCount.value - 1);
			} catch (err) {
				console.error("Ошибка обновления уведомления:", err);
			}
			if (notification.link) router.visit(notification.link);
		};
		const markAllAsRead = async () => {
			try {
				await axios$1.post("/notifications/mark-read", { all: true });
				notifications.value.forEach((n) => n.is_read = true);
				unreadCount.value = 0;
			} catch (err) {
				console.error("Ошибка обновления уведомлений:", err);
			}
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$21, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="notifications-container" data-v-65a1eb16${_scopeId}><div class="notifications-header" data-v-65a1eb16${_scopeId}><h1 data-v-65a1eb16${_scopeId}>Уведомления</h1>`);
						if (unreadCount.value > 0) _push(`<button class="mark-all-btn" data-v-65a1eb16${_scopeId}> Отметить все как прочитанные </button>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (notifications.value.length === 0) _push(`<div class="empty-notifications" data-v-65a1eb16${_scopeId}><p data-v-65a1eb16${_scopeId}>У вас пока нет уведомлений</p></div>`);
						else {
							_push(`<div class="notifications-list" data-v-65a1eb16${_scopeId}><!--[-->`);
							ssrRenderList(notifications.value, (notification) => {
								_push(`<div class="${ssrRenderClass([{ unread: !notification.is_read }, "notification-item"])}" data-v-65a1eb16${_scopeId}><div class="notification-icon" data-v-65a1eb16${_scopeId}>`);
								if (notification.type === "message") _push(`<span data-v-65a1eb16${_scopeId}>💬</span>`);
								else if (notification.type === "post_warning") _push(`<span data-v-65a1eb16${_scopeId}>⚠️</span>`);
								else if (notification.type === "post_hidden") _push(`<span data-v-65a1eb16${_scopeId}>🚫</span>`);
								else _push(`<span data-v-65a1eb16${_scopeId}>🔔</span>`);
								_push(`</div><div class="notification-content" data-v-65a1eb16${_scopeId}><div class="notification-title" data-v-65a1eb16${_scopeId}>${ssrInterpolate(notification.title)}</div><div class="notification-text" data-v-65a1eb16${_scopeId}>${ssrInterpolate(notification.content)}</div><div class="notification-time" data-v-65a1eb16${_scopeId}>${ssrInterpolate(notification.created_at)}</div></div>`);
								if (!notification.is_read) _push(`<div class="unread-dot" data-v-65a1eb16${_scopeId}></div>`);
								else _push(`<!---->`);
								_push(`</div>`);
							});
							_push(`<!--]--></div>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "notifications-container" }, [createVNode("div", { class: "notifications-header" }, [createVNode("h1", null, "Уведомления"), unreadCount.value > 0 ? (openBlock(), createBlock("button", {
						key: 0,
						onClick: markAllAsRead,
						class: "mark-all-btn"
					}, " Отметить все как прочитанные ")) : createCommentVNode("", true)]), notifications.value.length === 0 ? (openBlock(), createBlock("div", {
						key: 0,
						class: "empty-notifications"
					}, [createVNode("p", null, "У вас пока нет уведомлений")])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "notifications-list"
					}, [(openBlock(true), createBlock(Fragment, null, renderList(notifications.value, (notification) => {
						return openBlock(), createBlock("div", {
							key: notification.id,
							class: ["notification-item", { unread: !notification.is_read }],
							onClick: ($event) => handleNotificationClick(notification)
						}, [
							createVNode("div", { class: "notification-icon" }, [notification.type === "message" ? (openBlock(), createBlock("span", { key: 0 }, "💬")) : notification.type === "post_warning" ? (openBlock(), createBlock("span", { key: 1 }, "⚠️")) : notification.type === "post_hidden" ? (openBlock(), createBlock("span", { key: 2 }, "🚫")) : (openBlock(), createBlock("span", { key: 3 }, "🔔"))]),
							createVNode("div", { class: "notification-content" }, [
								createVNode("div", { class: "notification-title" }, toDisplayString(notification.title), 1),
								createVNode("div", { class: "notification-text" }, toDisplayString(notification.content), 1),
								createVNode("div", { class: "notification-time" }, toDisplayString(notification.created_at), 1)
							]),
							!notification.is_read ? (openBlock(), createBlock("div", {
								key: 0,
								class: "unread-dot"
							})) : createCommentVNode("", true)
						], 10, ["onClick"]);
					}), 128))]))])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Notifications.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Notifications_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-65a1eb16"]]);
//#endregion
//#region resources/js/ssr.js
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	resolve: (name) => {
		return (/* @__PURE__ */ Object.assign({
			"./Pages/Admin/Comments.vue": Comments_exports,
			"./Pages/Admin/Index.vue": Index_exports$2,
			"./Pages/Admin/Posts.vue": Posts_exports,
			"./Pages/Admin/Users.vue": Users_exports,
			"./Pages/Auth/Auth.vue": Auth_exports,
			"./Pages/Balance/Index.vue": Index_exports$1,
			"./Pages/Chat/Chats.vue": Chats_exports,
			"./Pages/Home.vue": Home_exports,
			"./Pages/Posts/Create.vue": Create_exports,
			"./Pages/Posts/Edit.vue": Edit_exports$1,
			"./Pages/Posts/Show.vue": Show_exports$1,
			"./Pages/Profile/Edit.vue": Edit_exports,
			"./Pages/Profile/Followers.vue": Followers_exports,
			"./Pages/Profile/Following.vue": Following_exports,
			"./Pages/Profile/LikedPosts.vue": LikedPosts_exports,
			"./Pages/Profile/Ratings.vue": Ratings_exports,
			"./Pages/Profile/Show.vue": Show_exports,
			"./Pages/Settings/Index.vue": Index_exports,
			"./Pages/Settings/Notifications.vue": Notifications_exports
		}))[`./Pages/${name}.vue`];
	},
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
