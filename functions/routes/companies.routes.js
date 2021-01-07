const { Router } = require('express')
const router = Router()

const admin = require('firebase-admin')

admin.initializeApp({
    // credential: admin.credential.cert('./permissions.json')
    credential: admin.credential.applicationDefault()
})
const db = admin.firestore()

router.get('/companies', async (req, res) => {
    try {
        let companies = {}
        const query = db.collection('sales')
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs
        docs.map(doc => {
            const company = doc.data().nameAgency
            const finalPrice = doc.data().finalPrice
            if (company in companies) {
                companies[company].total_sales += finalPrice,
                    companies[company].comision += (finalPrice * 0.025)
            }
            else companies[company] = {
                nameAgency: company,
                total_sales: finalPrice,
                comision: finalPrice * 0.025
            }
        })
        return res.status(200).json(Object.values(companies))
    }
    catch (error) {
        return res.status(500).send(error)
    }

})

router.post('/companies', async (req, res) => {
    try {
        req.body.forEach(async sale => {
            await db.collection('sales').doc().create({
                nameAgency: sale.nameAgency,
                day: sale.day ? sale.day : null,
                dayTo: sale.dayTo ? sale.dayTo : null,
                dayFrom: sale.dayFrom ? sale.dayFrom : null,
                name: sale.name,
                paymentStatus: sale.paymentStatus,
                finalPrice: sale.finalPrice,
                datePayment: sale.datePayment,
                createdAt: sale.createdAt,
                persons: sale.persons,
                hour: sale.hour,
                timeZone: sale.timeZone,
            })
        })

        return res.status(204)
    }
    catch (error) {
        return res.status(500).send(error)
    }

})

router.get('/companies/top/seller', async (req, res) => {
    try {
        let companies = {}
        const query = db.collection('sales')
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs
        docs.map(doc => {
            const company = doc.data().nameAgency
            const finalPrice = doc.data().finalPrice
            if (company in companies) {
                companies[company].total_sales += finalPrice,
                    companies[company].comision += (finalPrice * 0.025)
            }
            else companies[company] = {
                nameAgency: company,
                total_sales: finalPrice,
                comision: finalPrice * 0.025
            }
        })
        const sort_companies = Object.values(companies).sort((a, b) => { return a.total_sales > b.total_sales ? -1 : 1 })
        const top = sort_companies.length > 0 ? sort_companies[0] : null
        return res.status(200).json(top)
    }
    catch (error) {
        return res.status(500).send(error)
    }
})

router.get('/companies/top/month', async (req, res) => {
    try {
        let months = {}
        const query = db.collection('sales')
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs
        docs.map(doc => {
            const month = doc.data().datePayment.split('-')[1]
            const finalPrice = doc.data().finalPrice
            if (month in months)
                months[month].total_sales += finalPrice
            else months[month] = {
                month: month,
                total_sales: finalPrice,
            }
        })

        const sort_months = Object.values(months).sort((a, b) => { return a.total_sales > b.total_sales ? -1 : 1 })
        const top = sort_months.length > 0 ? sort_months[0] : null
        return res.status(200).json(top)
    }
    catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})

router.get('/companies/:company', async (req, res) => {
    try {
        const query = db.collection('sales')
        const querySnapshot = await query.where('nameAgency', '==', req.params.company).get()
        const docs = querySnapshot.docs
        const response = docs.map(doc => ({
            datePayment: doc.data().datePayment,
            name: doc.data().name,
            finalPrice: doc.data().finalPrice,
            persons: doc.data().persons,
            hour: doc.data().hour,
        }))
        return res.status(200).json(response)
    }
    catch (error) {
        return res.status(500).send(error)
    }

})

module.exports = router