export const Constants = {
    public: {
        Enums: {
            invoice_status: ["active", "archived", "draft", "paid", "overdue"],
            payment_method: [
                "master",
                "visa",
                "stripe",
                "paypal",
                "wise",
                "american_express",
                "cash",
                "transfer",
            ],
            stock_movement_type: ["in", "out", "adjust"],
        },
    },
};
