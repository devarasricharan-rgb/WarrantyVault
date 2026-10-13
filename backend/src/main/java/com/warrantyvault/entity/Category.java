package com.warrantyvault.entity;

public enum Category {
    MOBILE_PHONES("Mobile Phones"),
    LAPTOPS_AND_COMPUTERS("Laptops & Computers"),
    TVS_AND_MONITORS("TVs & Monitors"),
    AUDIO_DEVICES("Audio Devices"),
    HOME_APPLIANCES("Home Appliances"),
    CAMERAS("Cameras"),
    GAMING_DEVICES("Gaming Devices"),
    OTHER("Other");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
