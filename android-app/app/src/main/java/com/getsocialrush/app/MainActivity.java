
package com.getsocialrush.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView webView;
    private View loadingView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // -----------------------------
        // ROOT CONTAINER
        // -----------------------------
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(10, 12, 18));

        // -----------------------------
        // WEBVIEW
        // -----------------------------
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(10, 12, 18));

        FrameLayout.LayoutParams webParams =
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                );

        root.addView(webView, webParams);

        // -----------------------------
        // SOCIALRUSH LOADING SCREEN
        // -----------------------------
        LinearLayout loader = new LinearLayout(this);
        loader.setOrientation(LinearLayout.VERTICAL);
        loader.setGravity(Gravity.CENTER);
        loader.setPadding(40, 40, 40, 40);
        loader.setBackgroundColor(Color.rgb(10, 12, 18));

        ProgressBar progressBar = new ProgressBar(this);

        TextView brand = new TextView(this);
        brand.setText("SocialRUSH");
        brand.setTextColor(Color.WHITE);
        brand.setTextSize(25);
        brand.setGravity(Gravity.CENTER);
        brand.setPadding(0, 28, 0, 8);

        TextView loadingText = new TextView(this);
        loadingText.setText("Loading your dashboard…");
        loadingText.setTextColor(Color.rgb(190, 190, 200));
        loadingText.setTextSize(14);
        loadingText.setGravity(Gravity.CENTER);

        loader.addView(progressBar);
        loader.addView(brand);
        loader.addView(loadingText);

        FrameLayout.LayoutParams loaderParams =
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                );

        root.addView(loader, loaderParams);

        loadingView = loader;

        setContentView(root);

        // -----------------------------
        // FIX PHONE STATUS BAR OVERLAP
        // -----------------------------
        root.setOnApplyWindowInsetsListener((view, insets) -> {

            int topInset = insets.getSystemWindowInsetTop();
            int bottomInset = insets.getSystemWindowInsetBottom();

            view.setPadding(
                    0,
                    topInset,
                    0,
                    bottomInset
            );

            return insets;
        });

        root.requestApplyInsets();

        getWindow().setStatusBarColor(
                Color.rgb(10, 12, 18)
        );

        getWindow().setNavigationBarColor(
                Color.rgb(10, 12, 18)
        );

        // -----------------------------
        // WEBVIEW SETTINGS
        // -----------------------------
        WebSettings settings = webView.getSettings();

        // IMPORTANT:
        // Identifies ONLY the official SocialRUSH Android app.
        // This allows Android-only website fixes without
        // changing normal browser behaviour.
        String currentUserAgent =
                settings.getUserAgentString();

        if (currentUserAgent == null) {
            currentUserAgent = "";
        }

        if (!currentUserAgent.contains("SocialRUSHAndroid")) {
            settings.setUserAgentString(
                    currentUserAgent + " SocialRUSHAndroid"
            );
        }

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        // -----------------------------
        // COOKIES / LOGIN SESSION
        // -----------------------------
        CookieManager cookieManager =
                CookieManager.getInstance();

        cookieManager.setAcceptCookie(true);

        cookieManager.setAcceptThirdPartyCookies(
                webView,
                true
        );

        // -----------------------------
        // PAGE LOADING PROGRESS
        // -----------------------------
        webView.setWebChromeClient(
                new WebChromeClient() {

                    @Override
                    public void onProgressChanged(
                            WebView view,
                            int progress) {

                        super.onProgressChanged(
                                view,
                                progress
                        );

                        if (progress < 100) {
                            showLoading();
                        } else {
                            hideLoading();
                        }
                    }
                }
        );

        // -----------------------------
        // URL / NAVIGATION HANDLING
        // -----------------------------
        webView.setWebViewClient(
                new WebViewClient() {

                    @Override
                    public void onPageStarted(
                            WebView view,
                            String url,
                            android.graphics.Bitmap favicon) {

                        super.onPageStarted(
                                view,
                                url,
                                favicon
                        );

                        showLoading();
                    }

                    @Override
                    public void onPageFinished(
                            WebView view,
                            String url) {

                        super.onPageFinished(
                                view,
                                url
                        );

                        // Small delay prevents black flash
                        // while dashboard finishes rendering.
                        view.postDelayed(
                                () -> hideLoading(),
                                500
                        );
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(
                            WebView view,
                            WebResourceRequest request) {

                        Uri uri =
                                request.getUrl();

                        String host =
                                uri.getHost();

                        // Keep SocialRUSH pages
                        // inside the Android app.
                        if (host != null &&
                                (
                                        host.equals(
                                                "getsocialrush.com"
                                        )
                                                ||
                                                host.equals(
                                                        "www.getsocialrush.com"
                                                )
                                )) {

                            return false;
                        }

                        // External URLs such as Google OAuth
                        // open securely in browser.
                        try {

                            Intent intent =
                                    new Intent(
                                            Intent.ACTION_VIEW,
                                            uri
                                    );

                            startActivity(intent);

                            return true;

                        } catch (Exception e) {

                            return false;
                        }
                    }
                }
        );

        // -----------------------------
        // START SOCIALRUSH
        // -----------------------------
        showLoading();

        webView.loadUrl(
                "https://www.getsocialrush.com/dashboard"
        );
    }

    // -----------------------------
    // SHOW LOADING SCREEN
    // -----------------------------
    private void showLoading() {

        if (loadingView != null) {

            loadingView.setVisibility(
                    View.VISIBLE
            );

            loadingView.bringToFront();
        }
    }

    // -----------------------------
    // HIDE LOADING SCREEN
    // -----------------------------
    private void hideLoading() {

        if (loadingView != null) {

            loadingView.setVisibility(
                    View.GONE
            );
        }
    }

    // -----------------------------
    // ANDROID BACK BUTTON
    // -----------------------------
    @Override
    public void onBackPressed() {

        if (webView != null &&
                webView.canGoBack()) {

            webView.goBack();

        } else {

            super.onBackPressed();
        }
    }
}
