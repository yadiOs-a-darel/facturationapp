# Flutter Recreation Guide for GestFacturation

This guide outlines how to recreate the GestFacturation application as a Flutter Android app following Flutter best practices.

## Project Structure

```
lib/
├── core/
│   ├── constants/
│   │   └── app_constants.dart
│   ├── utils/
│   │   ├── extensions/
│   │   ├── helpers/
│   │   └── validators.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── endpoints.dart
│   │   └── interceptors/
│   └── theme/
│       ├── app_theme.dart
│       └── color_scheme.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_local_data_source.dart
│   │   │   │   └── auth_remote_data_source.dart
│   │   │   ├── models/
│   │   │   │   ├── login_request.dart
│   │   │   │   ├── login_response.dart
│   │   │   │   └── register_tenant_request.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login.dart
│   │   │       ├── logout.dart
│   │   │       └── register_tenant.dart
│   │   └── presentation/
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   └── register_tenant_page.dart
│   │       ├── widgets/
│   │       └── state/
│   │           ├── auth_notifier.dart
│   │           └── auth_state.dart
│   ├── customers/
│   ├── products/
│   ├── invoices/
│   │   └── stock/
├── di/
│   └── injection_container.dart
├── routes/
│   ├── app_routes.dart
│   └── routes.dart
└── main.dart
```

## Key Architectural Decisions

### 1. State Management
Use **Riverpod** for predictable state management:
- Providers for API clients and repositories
- StateNotifierProvider for UI state
- FutureProvider for asynchronous data loading

### 2. Dependency Injection
Use **get_it** for service locator pattern:
- Register APIs, repositories, and use cases
- Enable easy mocking for testing

### 3. Navigation
Use **go_router** for declarative routing:
- Protected routes with redirects
- Deep linking support
- Transition animations

### 4. Data Layer
Follow **clean architecture** principles:
- Separate data, domain, and presentation layers
- Use Freezed or JsonSerializable for models
- Implement proper error handling with custom exceptions

### 5. Storage
- **secure_storage** for JWT tokens (Android Keystore/iOS Keychain)
- **shared_preferences** for non-sensitive settings
- Consider **hive** or **isar** for local caching if needed

## Implementation Examples

### API Client (core/network/api_client.dart)
```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  ApiClient(this._dio, this._secureStorage) {
    _dio.interceptors.add(_AuthInterceptor(_secureStorage));
    _dio.options.baseUrl = AppConstants.apiBaseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);
  }

  Dio get instance => _dio;
}

class _AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _secureStorage;

  _AuthInterceptor(this._secureStorage);

  @override
  void onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _secureStorage.read(key: 'gestfacturation_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }
}
```

### Authentication Repository (features/auth/data/repositories/auth_repository_impl.dart)
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;
  final FlutterSecureStorage _secureStorage;

  AuthRepositoryImpl(this._apiClient, this._secureStorage);

  @override
  Future<User> login(String email, String password) async {
    final response = await _apiClient.instance.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );

    final token = response.data['token'] as String;
    await _secureStorage.write(key: 'gestfacturation_token', value: token);

    return User.fromJson(response.data['user']);
  }

  @override
  Future<void> logout() async {
    await _secureStorage.delete(key: 'gestfacturation_token');
  }
}
```

### Auth StateNotifier (features/auth/presentation/state/auth_notifier.dart)
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/exceptions.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login.dart';
import '../../domain/usecases/logout.dart';

class AuthNotifier extends StateNotifier<AuthState> {
  final LoginUseCase _loginUseCase;
  final LogoutUseCase _logoutUseCase;

  AuthNotifier(this._loginUseCase, this._logoutUseCase)
      : super(const AuthState.initial());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final user = await _loginUseCase(LoginParams(email, password));
      state = state.copyWith(
        isLoading: false,
        user: user,
        isAuthenticated: true,
      );
    } on Failure catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.message,
      );
    }
  }

  Future<void> logout() async {
    await _logoutUseCase(NoParams());
    state = state.copyWith(
      isAuthenticated: false,
      user: null,
    );
  }
}

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(loginUseCaseProvider),
    ref.read(logoutUseCaseProvider),
  );
});
```

### Login Page (features/auth/presentation/pages/login_page.dart)
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_button.dart';
import '../../state/auth_notifier.dart';

class LoginPage extends ConsumerWidget {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final authNotifier = ref.read(authNotifierProvider.notifier);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                const Text(
                  'Welcome Back',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 40),
                AppTextField(
                  controller: _emailController,
                  labelText: 'Email',
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Email required' : null,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _passwordController,
                  labelText: 'Password',
                  obscureText: true,
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Password required' : null,
                ),
                const SizedBox(height: 24),
                AppButton(
                  text: 'Sign In',
                  isLoading: authState.isLoading,
                  onPressed: authState.isLoading
                      ? null
                      : () async {
                          if (_formKey.currentState?.validate() ?? false) {
                            await authNotifier.login(
                              _emailController.text.trim(),
                              _passwordController.text,
                            );
                          }
                        },
                ),
                if (authState.errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Text(
                      authState.errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

### Routing (routes/app_routes.dart)
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_tenant_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isAuthenticated = ref.read(authNotifierProvider).isAuthenticated;
      final loggingIn = state.location == '/login';
      final registering = state.location == '/register-tenant';

      if (!isAuthenticated && !loggingIn && !registering) {
        return '/login';
      }
      if (isAuthenticated && (loggingIn || registering)) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register-tenant',
        name: 'register-tenant',
        builder: (context, state) => const RegisterTenantPage(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardPage(),
        routes: [
          GoRoute(
            path: 'customers',
            name: 'customers',
            builder: (context, state) => const CustomersPage(),
          ),
          GoRoute(
            path: 'products',
            name: 'products',
            builder: (context, state) => const ProductsPage(),
          ),
          GoRoute(
            path: 'invoices',
            name: 'invoices',
            builder: (context, state) => const InvoicesPage(),
          ),
          GoRoute(
            path: 'stock',
            name: 'stock',
            builder: (context, state) => const StockPage(),
          ),
        ],
      ),
    ],
  );
});
```

## Essential Packages (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.0
  go_router: ^14.0.0
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  freezed_annotation: ^2.4.1
  json_serializable: ^6.7.1
  equatable: ^2.0.5
  intl: ^0.18.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.6
  freezed: ^2.4.5
  json_serializable: ^6.7.1
```

## Flutter Best Practices Applied

1. **Platform Adaptation**
   - Use `Platform.isAndroid` for Android-specific code when needed
   - Follow Material Design guidelines
   - Handle back button navigation properly

2. **Performance**
   - Use `const` constructors where possible
   - Implement proper list scrolling with `ListView.builder`
   - Use `AutomaticKeepAlive` for tab views
   - Implement pagination for large lists

3. **Error Handling**
   - Centralized error handling with custom exceptions
   - User-friendly error messages
   - Loading states for all async operations
   - Retry mechanisms for failed requests

4. **Accessibility**
   - Proper semantic labels
   - Sufficient color contrast
   - Scalable text support
   - Screen reader compatibility

5. **Testing**
   - Unit tests for use cases and repositories
   - Widget tests for UI components
   - Integration tests for critical flows
   - Mock network responses with `mockito` or `mocktail`

6. **Code Quality**
   - Follow Dart lint rules (enabled via `flutter_lints`)
   - Proper documentation comments
   - Consistent naming conventions
   - Small, focused widgets and functions

## Migration Considerations from Original

| Original (Web/Desktop) | Flutter Android Equivalent |
|------------------------|----------------------------|
| TanStack Router        | go_riverpod (Riverpod + GoRouter) |
| TanStack Query         | Riverpod FutureProvider/StreamProvider + manual caching |
| shadcn/ui              | Custom widgets following Material Design or Flutter community packages |
| Axios API client       | Dio with interceptors |
| localStorage JWT       | flutter_secure_storage |
| Express API endpoints  | Same endpoints consumed via Dio |
| Electron desktop       | Not applicable (Flutter mobile-first) |

## Next Steps for Implementation

1. Create new Flutter project: `flutter create gestfacturation_flutter`
2. Set up Riverpod and dependency injection
3. Implement authentication flow first
4. Create shared models and API client
5. Build feature modules incrementally (customers → products → invoices → stock)
6. Add proper error handling and loading states
7. Implement local storage for tokens
8. Add unit and widget tests
9. Optimize performance and accessibility
10. Create release builds for Android Play Store

This structure provides a solid foundation that follows Flutter community best practices while maintaining the core functionality of the original GestFacturation application.